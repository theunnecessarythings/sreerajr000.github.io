import React, { useState } from "react";

export const part1 = [
  {
    cuda: `__global__ void residual_fwd_kernel(float *__restrict__ out,
                                     const float *__restrict__ inp1,
                                     const float *__restrict__ inp2, int N)`,
    ptx: `.visible .entry residual_fwd_kernel(
	.param .u64 out_param,
	.param .u64 inp1_param,
	.param .u64 inp2_param,
	.param .u32 N_param
)`,
    explanation:
      "This section declares the CUDA kernel `residual_fwd_kernel` and its parameters. In PTX, this translates to defining a visible entry point (`.visible .entry`) with corresponding parameters. The pointers (`out`, `inp1`, `inp2`) are passed as 64-bit unsigned integers (`.u64`), and the integer `N` is passed as a 32-bit unsigned integer (`.u32`). The `__restrict__` keyword is a hint to the compiler that the pointers do not alias.",
  },
  {
    cuda: `{`,
    ptx: `{
	.reg .pred 	%guard;
	.reg .b64 %out_addr, %inp1_addr, %inp2_addr, %inp1_glbl, %inp2_glbl, %out_glbl, %offset;
	.reg .b32 %N, %tid_x, %blockid_x, %blockdim_x, %idx;
	.reg .f32 %inp1_i, %inp2_i, %out_i;
	.reg .b64 %inp1_i_addr, %inp2_i_addr, %out_i_addr;
`,
    explanation:
      "The start of the kernel body. In PTX, this is where we declare the virtual registers. Registers are typed and must be declared before use. For example, `.reg .pred` declares a predicate register, `.reg .b64` declares 64-bit registers for addresses, and `.reg .f32` declares 32-bit floating-point registers.",
  },
  {
    cuda: `// (Implicit) Load parameters`,
    ptx: `	ld.param.u64 	%out_addr, [out_param];
	ld.param.u64 	%inp1_addr, [inp1_param];
	ld.param.u64 	%inp2_addr, [inp2_param];
	ld.param.u32 	%N, [N_param];`,
    explanation:
      "The `ld.param` (load parameter) instruction loads the kernel arguments from parameter space into registers, making them available for use within the kernel.",
  },
  {
    cuda: `int i = blockIdx.x * blockDim.x + threadIdx.x;`,
    ptx: `	mov.u32 	%blockid_x, %ctaid.x;
	mov.u32 	%blockdim_x, %ntid.x;
	mov.u32 	%tid_x, %tid.x;
	mad.lo.s32 	%idx, %blockid_x, %blockdim_x, %tid_x;`,
    explanation:
      "This calculates the unique global index `i` for each thread. It uses special registers like `%ctaid.x` (block ID) and `%tid.x` (thread ID), then performs a fused `mad.lo.s32` (Multiply-Add Low) instruction: `%idx = %blockid_x * %blockdim_x + %tid_x`.",
  },
  {
    cuda: `if (i >= N)
  return;`,
    ptx: `	setp.ge.s32 	%guard, %idx, %N;
	@%guard bra 	$exit;`,
    explanation:
      "A guard to prevent out-of-bounds access. `setp.ge.s32` (Set Predicate) sets the `%guard` register to true if `idx >= N`. The next instruction, `@%guard bra $exit;`, is a predicated branch: if `%guard` is true, the program jumps to the `$exit` label.",
  },
  {
    cuda: `out[i] = inp1[i] + inp2[i];`,
    ptx: `	cvta.to.global.u64 	%inp1_glbl, %inp1_addr;
	mul.wide.s32 	%offset, %idx, 4;
	add.s64 	%inp1_i_addr, %inp1_glbl, %offset;
	cvta.to.global.u64 	%inp2_glbl, %inp2_addr;
	add.s64 	%inp2_i_addr, %inp2_glbl, %offset;`,
    explanation:
      "PART 1: Address Calculation. Before loading, the memory addresses are computed. It multiplies the index `%idx` by 4 (for `float`) to get a byte `%offset`, then adds it to the base address of each input array.",
  },
  {
    cuda: `// (cont'd)`,
    ptx: `	ld.global.nc.f32 	%inp1_i, [%inp1_i_addr];
	ld.global.nc.f32 	%inp2_i, [%inp2_i_addr];`,
    explanation:
      "PART 2: Loading Data. The `ld.global.nc.f32` instruction loads a 32-bit float from global memory into a register. The `.nc` suffix is a cache hint ('non-coherent').",
  },
  {
    cuda: `// (cont'd)`,
    ptx: `	add.f32 	%out_i, %inp1_i, %inp2_i;`,
    explanation:
      "PART 3: The Computation. The `add.f32` instruction performs the core 32-bit floating-point addition on the two values loaded into registers, storing the result in `%out_i`.",
  },
  {
    cuda: `// (cont'd)`,
    ptx: `	cvta.to.global.u64 	%out_glbl, %out_addr;
	add.s64 	%out_i_addr, %out_glbl, %offset;
	st.global.f32 	[%out_i_addr], %out_i;`,
    explanation:
      "PART 4: Storing the Result. The final address for `out[i]` is calculated. Then, `st.global.f32` (Store Global) writes the result from register `%out_i` into global memory.",
  },
  {
    cuda: `}`,
    ptx: `$exit:
	ret;`,
    explanation:
      "The end of the kernel. `$exit:` is the label for the out-of-bounds branch. The `ret` (return) instruction ends the thread's execution.",
  },
];

export const part2 = [
  {
    cuda: `#define GELU_SCALING_FACTOR sqrtf(2.0f / M_PI)`,
    ptx: `/* Constant folded by the compiler.
       The value √(2/π) ≃ 0.7978846f appears later as the
       32-bit hex literal 0F3f4c4229 in:
           mul.f32 %tmp4, 0F3f4c4229, %tmp3;`,
    explanation:
      "The macro is resolved at compile-time, so no separate PTX directive is emitted. \
       Instead, the numeric value √(2/π) is baked directly into an instruction as the \
       immediate constant `0F3f4c4229` (IEEE-754 encoding of 0.7978846 f).",
  },
  {
    cuda: `__global__ void gelu_fwd_kernel(float *__restrict__ out, const float *__restrict__ inp, int N)`,
    ptx: `.visible .entry gelu_fwd_kernel(
      .param .u64 out_param,
      .param .u64 inp_param,
      .param .u32 N_param
    )`,
    explanation:
      "Declares the kernel entry point and its parameters.  In PTX the function is \
       marked `.visible .entry` and each pointer (`out`, `inp`) is passed as a 64-bit \
       unsigned integer (`.u64`), while the length `N` is a 32-bit unsigned integer (`.u32`).",
  },
  {
    cuda: `{`,
    ptx: `  .reg .pred  %guard;
  .reg .b32  %N, %tid_x, %blockid_x, %blockdim_x, %idx;
  .reg .f32  %inp_i, %out_i, %tmp<9>;
  .reg .b64  %out_addr, %inp_addr, %out_glbl, %inp_glbl, %offset;
  .reg .b64  %inp_i_addr, %out_i_addr;`,
    explanation:
      "Opening the kernel body.  PTX requires every virtual register to be declared \
       with a type before use: predicate (`.pred`), 32-bit integer (`.b32`), 32-bit float \
       (`.f32`), and 64-bit address (`.b64`).",
  },
  {
    cuda: `  int i = blockIdx.x * blockDim.x + threadIdx.x;`,
    ptx: `  mov.u32 %blockid_x, %ctaid.x;
  mov.u32 %blockdim_x, %ntid.x;
  mov.u32 %tid_x,   %tid.x;
  mad.lo.s32 %idx, %blockid_x, %blockdim_x, %tid_x;`,
    explanation:
      "`%ctaid.x`, `%ntid.x`, and `%tid.x` are special registers holding the block ID, \
       block size, and thread ID.  The fused multiply-add `mad.lo.s32` computes \
       `i = blockIdx.x * blockDim.x + threadIdx.x` in one instruction.",
  },
  {
    cuda: `  if (i >= N)`,
    ptx: `  setp.ge.s32 %guard, %idx, %N;`,
    explanation:
      "`setp.ge.s32` sets the predicate register `%guard` to true when `i ≥ N`, forming \
       the condition for an early exit.",
  },
  {
    cuda: `    return;`,
    ptx: `  @%guard bra $exit;`,
    explanation:
      "A predicated branch: if `%guard` is true, execution jumps to the `$exit` label, \
       skipping the rest of the computation.",
  },
  {
    cuda: `  float x = inp[i];`,
    ptx: `  cvta.to.global.u64 %inp_glbl, %inp_addr;   // convert params to global addr
  mul.wide.s32  %offset, %idx, 4;                      // byte offset (i * sizeof(float))
  add.s64        %inp_i_addr, %inp_glbl, %offset;      // element address
  ld.global.nc.f32 %inp_i, [%inp_i_addr];              // x ← inp[i]`,
    explanation:
      "The element address is calculated (`i * 4` bytes, base-added), then a 32-bit \
       float is loaded from global memory into `%inp_i`.",
  },
  {
    cuda: `  float cube = 0.044715f * x * x * x;`,
    ptx: `  mul.f32 %tmp1, %inp_i, %inp_i;          // x²
  mul.f32 %tmp2, %inp_i, %tmp1;           // x³
  mul.f32 %cube,  %tmp2, 0F3d372713;      // 0.044715f * x³`,
    explanation:
      "Three multiplies build the `x³` term and scale it by the literal `0x3d372713` \
       (float 0.044715).  The result is placed in `%cube`.",
  },
  {
    cuda: `// (cont'd)`,
    ptx: `  add.f32 %tmp3, %cube, %inp_i;           // x + cube`,
    explanation:
      "The intermediate sum `(x + cube)` is formed and stored in `%tmp3`. \
       Newer compilers often fuse the last multiply and this add into an \
       `fma.rn.f32`, but the semantic result is the same.",
  },
  {
    cuda: `  out[i] = 0.5f * x * (1.0f + tanhf(GELU_SCALING_FACTOR * (x + cube)));`,
    ptx: `  mul.f32 %tmp4, 0F3f4c4229, %tmp3;       // √(2/π) * (x + cube)
  tanh.approx.f32 %tmp5, %tmp4;            // tanh(...)
  add.f32 %tmp6, %tmp5, 0F3F800000;        // 1.0f + tanh(...)
  mul.f32 %tmp7, %tmp6, %inp_i;            // x * (...)
  mul.f32 %out_i, %tmp7, 0F3F000000;       // 0.5f * ...`,
    explanation:
      "The GELU formula is expanded step-by-step: multiply by the scaling factor, \
       apply `tanh`, add 1, multiply by `x`, then by 0.5.  Hex immediates represent \
       `√(2/π)` (`0x3f4c4229`), `1.0` (`0x3f800000`), and `0.5` (`0x3f000000`).",
  },
  {
    cuda: `// (cont'd)`,
    ptx: `  cvta.to.global.u64 %out_glbl, %out_addr;
  add.s64  %out_i_addr, %out_glbl, %offset;
  st.global.f32 [%out_i_addr], %out_i;`,
    explanation:
      "The byte offset computed earlier is reused to address `out[i]`, and the \
       calculated result in `%out_i` is stored back to global memory.",
  },
  {
    cuda: `}`,
    ptx: `$exit:
    ret;`,
    explanation:
      "`$exit:` is the target label for the early-return branch.  `ret` terminates the \
       thread’s execution and closes the PTX function.",
  },
];

export const part3 = [
  /* ─────────────────────────────────────────────
     Kernel declaration & prologue
     ─────────────────────────────────────────── */
  {
    cuda: `__global__ void encoder_fwd_kernel_vec(float *out, const int *inp, const float *wte, const float *wpe, int B, int T, int C)`,
    ptx: `.visible .entry encoder_fwd_kernel(
    .param .u64 p_out,
    .param .u64 p_inp,
    .param .u64 p_wte,
    .param .u64 p_wpe,
    .param .u32 p_B,
    .param .u32 p_T,
    .param .u32 p_C
)`,
    explanation:
      "The CUDA kernel signature becomes a PTX entry point.  Each pointer is passed as \
       a 64-bit unsigned parameter (`.u64`), the integers `B`, `T`, `C` as 32-bit \
       unsigned (`.u32`).  The kernel is marked `.visible .entry` so the driver can \
       launch it.",
  },
  {
    cuda: `{`,
    ptx: `// register declarations omitted here for brevity; see function body`,
    explanation:
      "The opening brace begins the function body.  PTX must declare every virtual \
       register in advance (predicate, 32-bit/64-bit int, float, and vector registers).",
  },

  /* ─────────────────────────────────────────────
     Thread-local indices
     ─────────────────────────────────────────── */
  {
    cuda: `  int b = blockIdx.y;`,
    ptx: `mov.u32 %r_b, %ctaid.y;`,
    explanation:
      "`%ctaid.y` holds the Y-dimension block ID.  It is moved into a general register \
       `%r_b` to form the batch index `b`.",
  },
  {
    cuda: `  int t = blockIdx.x;`,
    ptx: `mov.u32 %r_t, %ctaid.x;`,
    explanation:
      "`%ctaid.x` (block ID along X) is copied to `%r_t`, giving the time-step index `t`.",
  },
  {
    cuda: `  // Each thread now handles 4 float elements, so our grid of threads is smaller`,
    ptx: ``,
    explanation: "This is a comment only; no PTX code is emitted.",
  },
  {
    cuda: `  int c_vec = threadIdx.x;`,
    ptx: `mov.u32 %r_cvec, %tid.x;`,
    explanation:
      "`%tid.x` is the thread ID within the block.  It is stored in `%r_cvec`, the \
       coarse (vector) channel index handled by this thread.",
  },

  /* ─────────────────────────────────────────────
     Vector-lane offset
     ─────────────────────────────────────────── */
  {
    cuda: `  // The starting index for the 4 floats this thread will handle`,
    ptx: ``,
    explanation: "Comment only; no PTX generated.",
  },
  {
    cuda: `  int c_start = c_vec * 4;`,
    ptx: `shl.b32 %r_c_start_elems, %r_cvec, 2;`,
    explanation:
      "A left-shift by 2 bits multiplies `c_vec` by 4, giving `c_start`; the result is \
       stored in `%r_c_start_elems`.",
  },

  /* ─────────────────────────────────────────────
     Boundary check
     ─────────────────────────────────────────── */
  {
    cuda: `  // Boundary check`,
    ptx: ``,
    explanation:
      "Comment only.  The actual guard test appears on the next PTX line.",
  },
  {
    cuda: `  if (b < B && t < T && c_start < C) {`,
    ptx: `setp.lt.u32 %p_guard, %r_c_start_elems, %r_C;
@!%p_guard bra EXIT;`,
    explanation:
      "The compiler relies on the launch configuration to guarantee `b < B` and \
       `t < T`, so only `c_start < C` is emitted. `setp.lt.u32` sets `%p_guard` if \
       the condition is **true**.  The NOT predicate (`@!%p_guard`) branches to \
       `EXIT` when the condition fails, mimicking the high-level `if`.",
  },

  /* ─────────────────────────────────────────────
     Token id lookup
     ─────────────────────────────────────────── */
  {
    cuda: `    // Get the token index for this position`,
    ptx: ``,
    explanation: "Comment; no PTX.",
  },
  {
    cuda: `    int ix = inp[b * T + t];`,
    ptx: `mad.lo.u32   %r_flat_idx, %r_b, %r_T, %r_t;        // b*T + t
mad.wide.u32 %rd_addr,  %r_flat_idx, 4, %ptr_inp;   // byte offset
ld.global.u32 %r_token_id, [%rd_addr];              // ix = inp[...]`,
    explanation:
      "First a multiply-add computes the flattened index `b*T + t`.  The wide MAD \
       extends it to 64-bit bytes (×4) and adds the base pointer `%ptr_inp`, forming \
       the address.  `ld.global.u32` fetches the 32-bit token ID (`ix`).",
  },

  /* ─────────────────────────────────────────────
     Row base pointers
     ─────────────────────────────────────────── */
  {
    cuda: `    // Get base pointers to the correct rows in the embedding tables`,
    ptx: ``,
    explanation: "Comment only.",
  },
  {
    cuda: `    const float *wte_row = wte + ix * C;`,
    ptx: `mad.lo.u32   %r_wte_offset_elems, %r_token_id, %r_C, %r_c_start_elems;`,
    explanation:
      "`ix * C + c_start` is calculated with `mad.lo.u32`, producing an element \
       offset for the word-token embedding row.",
  },
  {
    cuda: `    const float *wpe_row = wpe + t * C;`,
    ptx: `mad.lo.u32   %r_wpe_offset_elems, %r_t, %r_C, %r_c_start_elems;`,
    explanation:
      "`t * C + c_start` is similarly produced for the positional embedding row.",
  },
  {
    cuda: `    float *out_row = out + b * T * C + t * C;`,
    ptx: `mad.lo.u32   %r_out_offset_elems, %r_flat_idx, %r_C, %r_c_start_elems;`,
    explanation:
      "The flattened index `b*T + t` is multiplied by `C` (elements) and added to \
       `c_start` to form the output offset within `out`.",
  },

  /* ─────────────────────────────────────────────
     Vector pointer casts (compile-time only)
     ─────────────────────────────────────────── */
  {
    cuda: `    // Cast pointers to float4 pointers to load 128 bits at once`,
    ptx: ``,
    explanation:
      "Pointer casts are purely semantic at compile time; the PTX uses vector load \
       instructions instead of explicit casts.",
  },
  {
    cuda: `    const float4 *wte_ptr = reinterpret_cast<const float4 *>(wte_row + c_start);`,
    ptx: ``,
    explanation:
      "No direct PTX is emitted; the address computed earlier (`%r_wte_offset_elems`) \
       will be fed to a vector load.",
  },
  {
    cuda: `    const float4 *wpe_ptr = reinterpret_cast<const float4 *>(wpe_row + c_start);`,
    ptx: ``,
    explanation: "Same rationale as the previous line.",
  },
  {
    cuda: `    float4 *out_ptr = reinterpret_cast<float4 *>(out_row + c_start);`,
    ptx: ``,
    explanation: "Analogous: address is already in `%r_out_offset_elems`.",
  },

  /* ─────────────────────────────────────────────
     Vector loads
     ─────────────────────────────────────────── */
  {
    cuda: `    // Load the vectorized data`,
    ptx: ``,
    explanation: "Comment line.",
  },
  {
    cuda: `    float4 wte_val = *wte_ptr;`,
    ptx: `mad.wide.u32 %rd_addr, %r_wte_offset_elems, 4, %ptr_wte;
ld.global.nc.v4.f32 {%f_wte0,%f_wte1,%f_wte2,%f_wte3}, [%rd_addr];`,
    explanation:
      "`mad.wide.u32` converts the element offset to a byte address (×4) and adds the \
       base of `wte`.  The vector load `ld.global.nc.v4.f32` fetches four floats into \
       registers `%f_wte0–3`.",
  },
  {
    cuda: `    float4 wpe_val = *wpe_ptr;`,
    ptx: `mad.wide.u32 %rd_addr, %r_wpe_offset_elems, 4, %ptr_wpe;
ld.global.nc.v4.f32 {%f_wpe0,%f_wpe1,%f_wpe2,%f_wpe3}, [%rd_addr];`,
    explanation:
      "The positional embedding vector is loaded with an analogous address calculation \
       and `ld.global.nc.v4.f32` instruction.",
  },

  /* ─────────────────────────────────────────────
     Elementwise addition
     ─────────────────────────────────────────── */
  {
    cuda: `    // Perform the additions component-wise`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `    float4 out_val;`,
    ptx: ``,
    explanation:
      "Declaration only; PTX registers `%f_out0–3` will hold the results.",
  },
  {
    cuda: `    out_val.x = wte_val.x + wpe_val.x;`,
    ptx: `add.f32 %f_out0, %f_wte0, %f_wpe0;`,
    explanation:
      "Adds the first lane of the two vectors, storing it in `%f_out0`.",
  },
  {
    cuda: `    out_val.y = wte_val.y + wpe_val.y;`,
    ptx: `add.f32 %f_out1, %f_wte1, %f_wpe1;`,
    explanation: "Second lane addition.",
  },
  {
    cuda: `    out_val.z = wte_val.z + wpe_val.z;`,
    ptx: `add.f32 %f_out2, %f_wte2, %f_wpe2;`,
    explanation: "Third lane addition.",
  },
  {
    cuda: `    out_val.w = wte_val.w + wpe_val.w;`,
    ptx: `add.f32 %f_out3, %f_wte3, %f_wpe3;`,
    explanation: "Fourth lane addition.",
  },

  /* ─────────────────────────────────────────────
     Vector store
     ─────────────────────────────────────────── */
  {
    cuda: `    // Write the vectorized result back to global memory`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `    *out_ptr = out_val;`,
    ptx: `mad.wide.u32 %rd_addr, %r_out_offset_elems, 4, %ptr_out;
st.global.v4.f32 [%rd_addr], {%f_out0,%f_out1,%f_out2,%f_out3};`,
    explanation:
      "`mad.wide.u32` forms the 128-bit destination address inside `out`, and \
       `st.global.v4.f32` stores the four-element vector to global memory.",
  },

  /* ─────────────────────────────────────────────
     Close braces & return
     ─────────────────────────────────────────── */
  {
    cuda: `  }`,
    ptx: ``,
    explanation:
      "Closing brace of the conditional block; the thread falls through to the epilogue.",
  },
  {
    cuda: `}`,
    ptx: `EXIT:
    ret;`,
    explanation:
      "`EXIT:` is the target of the early-exit branch.  `ret` terminates the thread.",
  },
];

export const part4 = [
  /* ─────────────────────────────────────────────
     1. Signature & prologue
     ─────────────────────────────────────────── */
  {
    cuda: `__global__ void layernorm_fwd_kernel(float *out, const float *inp, const float *weight, const float *bias, int C, float eps)`,
    ptx: `.visible .entry layernorm_fwd_kernel(
  .param .u64 out_param,
  .param .u64 inp_param,
  .param .u64 weight_param,
  .param .u64 bias_param,
  .param .s32 N_param,
  .param .s32 C_param
)`,
    explanation:
      "The kernel header becomes a PTX entry point with six parameters.  Pointers are \
       passed as 64-bit (`.u64`) and the integers `N` (the number of rows, called \
       `bt` in CUDA) and `C` are 32-bit signed (`.s32`).",
  },
  {
    cuda: `{`,
    ptx: `.shared .align 4 .b8 %shared_sum_arr[128];
.shared .align 4 .b8 %shared_sum2_arr[128];`,
    explanation:
      "The opening brace begins the body.  Two statically-sized shared arrays are \
       allocated for the running sums of *x* and *x²*.  The compiler chose fixed 128-byte \
       buffers instead of a single `extern` array.",
  },

  /* ─────────────────────────────────────────────
     2. Shared buffer declaration
     ─────────────────────────────────────────── */
  {
    cuda: `  extern __shared__ float shared_buffer[];`,
    ptx: `// handled by the two .shared declarations above`,
    explanation:
      "`extern __shared__` requests dynamic shared memory, but the compiler replaced \
       it with two static 128-byte buffers (`%shared_sum_arr`, `%shared_sum2_arr`).",
  },

  /* ─────────────────────────────────────────────
     3. Row pointer set-up
     ─────────────────────────────────────────── */
  {
    cuda: `  int bt = blockIdx.x;`,
    ptx: `mov.s32 %idx, %ctaid.x;`,
    explanation:
      "`%ctaid.x` is copied into `%idx`, giving the row (‘batch-time’) index `bt`.",
  },
  {
    cuda: `  const float *x = inp + bt * C;`,
    ptx: `shl.b32   %C4,  %C, 2;                 // C*4 = bytes per row
mad.wide.s32 %x_ptr, %idx, %C4, %inp_ptr;  // x = inp + bt*C`,
    explanation:
      "The element count `C` is converted to bytes (`×4`) then combined with `bt` to \
       compute the base address `%x_ptr` for this row of *x*.",
  },
  {
    cuda: `  float *y = out + bt * C;`,
    ptx: `mad.wide.s32 %out_ptr, %idx, %C4, %out_ptr;`,
    explanation:
      "A similar `mad.wide.s32` prepares the base pointer for the output row `y`.",
  },

  /* ─────────────────────────────────────────────
     4. Thread/block IDs
     ─────────────────────────────────────────── */
  {
    cuda: `  int tid = threadIdx.x;`,
    ptx: `mov.s32 %tidx, %tid.x;`,
    explanation: "`%tid.x` (thread-ID) is stored in `%tidx`.",
  },
  {
    cuda: `  int block_size = blockDim.x;`,
    ptx: `mov.s32 %ntidx, %ntid.x;`,
    explanation:
      "`%ntid.x` gives the number of threads per block (`blockDim.x`). \
       It is saved as `%ntidx`.",
  },

  /* ─────────────────────────────────────────────
     5. Parallel-mean pre-loop initialisers
     ─────────────────────────────────────────── */
  {
    cuda: `  // --- Parallel Mean Calculation ---`,
    ptx: ``,
    explanation: "Comment – no PTX emitted.",
  },
  {
    cuda: `  float sum = 0.0f;`,
    ptx: `mov.f32 %thread_sum, 0f00000000;`,
    explanation: "Initialises the per-thread running sum register to +0.0.",
  },
  {
    cuda: `  for (int i = tid; i < C; i += block_size) {`,
    ptx: `mov.s32 %i, %tidx;
bra $thread_local_cond;`,
    explanation:
      "Loop prologue: the loop index `%i` starts at `tid` and jumps to a condition \
       check label `$thread_local_cond`.",
  },
  {
    cuda: `    sum += x[i];`,
    ptx: `mad.wide.s32 %xi_ptr, %i, 4, %x_ptr;  // &x[i]
ld.global.f32 %xi, [%xi_ptr];
add.f32       %thread_sum, %thread_sum, %xi;`,
    explanation: "Loads `x[i]` and accumulates it into `%thread_sum`.",
  },
  {
    cuda: `  }`,
    ptx: `add.s32 %i, %i, %ntidx;
$thread_local_cond:
setp.lt.s32 %cond, %i, %C;
@%cond bra $thread_local_loop;`,
    explanation:
      "Increments `i` by `block_size`, tests `i < C`, and branches back for the next \
       loop iteration – exactly mirroring the CUDA `for`.",
  },

  /* ─────────────────────────────────────────────
     6. Save partial mean to shared
     ─────────────────────────────────────────── */
  {
    cuda: `  shared_buffer[tid] = sum;`,
    ptx: `// compiler stores only warp-leader results:
setp.eq.s32 %cond, %lane_id, 0;
@!%cond bra $after_shared_write;
mad.lo.s32 %shared_sum_ptr, %warp_id, 4, %shared_sum;
st.shared.f32 [%shared_sum_ptr], %thread_sum;
$after_shared_write:`,
    explanation:
      "Rather than every thread writing, the compiler performs an intra-warp reduction \
       (using `shfl.sync.down`) and only the lane-0 thread of each warp writes the \
       partial sum to shared memory.",
  },
  {
    cuda: `  __syncthreads();`,
    ptx: `bar.sync 0;`,
    explanation:
      "A barrier so all partial sums are visible before the next stage.",
  },

  /* ─────────────────────────────────────────────
     7. Shared-memory reduction (mean)
     ─────────────────────────────────────────── */
  {
    cuda: `  // Reduction in shared memory`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  for (int stride = block_size / 2; stride > 0; stride >>= 1) {`,
    ptx: `// implemented in two levels:
  // 1) intra-warp shuffle (already done)
  // 2) warp-leaders read & reduce again (below)`,
    explanation:
      "The high-level shared-memory reduction is compiled into a second warp-level \
       `shfl.sync.down` reduction across the warp-leader values that were written to \
       shared memory.",
  },
  {
    cuda: `    if (tid < stride) {`,
    ptx: ``,
    explanation:
      "Predicate tests inside the CUDA loop disappear because the compiler’s \
       two-stage reduction uses warps and shuffles instead of an explicit `if`.",
  },
  {
    cuda: `      shared_buffer[tid] += shared_buffer[tid + stride];`,
    ptx: ``,
    explanation:
      "Same as above: this pairwise addition is replaced by `shfl.sync.down` operations.",
  },
  {
    cuda: `    }`,
    ptx: ``,
    explanation: "End of `if` – handled implicitly.",
  },
  {
    cuda: `    __syncthreads();`,
    ptx: `// Not needed; compiler uses warp-level ops, then one barrier later.`,
    explanation:
      "The compiler rewrites the reduction to avoid a barrier inside the loop.",
  },
  {
    cuda: `  }`,
    ptx: ``,
    explanation: "Close of the mean-reduction loop.",
  },
  {
    cuda: `  float mean = shared_buffer[0] / C;`,
    ptx: `shfl.sync.idx.b32 %block_sumf32, %warp_sum, 0, 0x1f, 0xffffffff;
cvt.rn.f32.s32 %Cf32, %C;
div.rn.f32     %m, %block_sumf32, %Cf32;`,
    explanation:
      "The final block-wide sum is broadcast with `shfl.sync.idx`, converted to `float`, \
       and divided by `C` to obtain `mean` (`%m`).",
  },
  {
    cuda: `  __syncthreads(); // Ensure mean is visible to all`,
    ptx: `bar.sync 0;`,
    explanation:
      "Barrier so every thread has the computed mean before proceeding.",
  },

  /* ─────────────────────────────────────────────
     8. Parallel variance calculation
     ─────────────────────────────────────────── */
  {
    cuda: `  // --- Parallel Variance Calculation ---`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  sum = 0.0f;`,
    ptx: `mov.f32 %thread_sum2, 0f00000000;`,
    explanation: "`%thread_sum2` is reused to accumulate (x-mean)².",
  },
  {
    cuda: `  for (int i = tid; i < C; i += block_size) {`,
    ptx: `mov.s32 %i, %tidx;
bra $thread_local_cond_var;`,
    explanation: "Second thread loop prologue for the variance pass.",
  },
  {
    cuda: `    float diff = x[i] - mean;`,
    ptx: `mad.wide.s32 %xi_ptr, %i, 4, %x_ptr;
ld.global.f32 %xi, [%xi_ptr];
sub.f32       %n, %xi, %m;`,
    explanation:
      "Loads `x[i]` and subtracts the previously computed mean, producing `diff` (`%n`).",
  },
  {
    cuda: `    sum += diff * diff;`,
    ptx: `mul.f32       %n, %n, %n;
add.f32       %thread_sum2, %thread_sum2, %n;`,
    explanation: "Squares the difference and accumulates into `%thread_sum2`.",
  },
  {
    cuda: `  }`,
    ptx: `add.s32 %i, %i, %ntidx;
$thread_local_cond_var:
setp.lt.s32 %cond, %i, %C;
@%cond bra $thread_local_loop;`,
    explanation: "Loop increment, test, and branch exactly like the mean loop.",
  },

  /* ─────────────────────────────────────────────
     9. Write variance partials & reduce
     ─────────────────────────────────────────── */
  {
    cuda: `  shared_buffer[tid] = sum;`,
    ptx: `setp.eq.s32 %cond, %lane_id, 0;
@!%cond bra $after_shared_write2;
mad.lo.s32 %shared_sum2_ptr, %warp_id, 4, %shared_sum2;
st.shared.f32 [%shared_sum2_ptr], %thread_sum2;
$after_shared_write2:`,
    explanation:
      "Warp-leaders write their (diff²) sums to the second shared buffer.",
  },
  {
    cuda: `  __syncthreads();`,
    ptx: `bar.sync 0;`,
    explanation: "Barrier before the second reduction stage.",
  },
  {
    cuda: `  // Reduction in shared memory`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  for (int stride = block_size / 2; stride > 0; stride >>= 1) {`,
    ptx: `// compiled into a second warp-shuffle reduction (see PTX around $warp_reduce_loop2)`,
    explanation:
      "As with the mean, the loop is lowered to warp-level shuffles + one barrier.",
  },
  {
    cuda: `    if (tid < stride) {`,
    ptx: ``,
    explanation: "Condition removed in compiler-generated pattern.",
  },
  {
    cuda: `      shared_buffer[tid] += shared_buffer[tid + stride];`,
    ptx: ``,
    explanation:
      "Replaced by the shuffle arithmetic visible in `$warp_reduce_loop2`.",
  },
  {
    cuda: `    }`,
    ptx: ``,
    explanation: "End `if`.",
  },
  {
    cuda: `    __syncthreads();`,
    ptx: ``,
    explanation:
      "Removed; the warp-shuffle pattern needs only one barrier afterwards.",
  },
  {
    cuda: `  }`,
    ptx: ``,
    explanation: "Close of variance-reduction loop.",
  },
  {
    cuda: `  float var = shared_buffer[0] / C;`,
    ptx: `shfl.sync.idx.b32 %block_sum2f32, %warp_sum2, 0, 0x1f, 0xffffffff;
div.rn.f32     %block_sum2f32, %block_sum2f32, %Cf32;
sub.f32         %var, %block_sum2f32, %m2;`,
    explanation:
      "The block-wide sum of squares is divided by `C`, minus mean², giving the \
       variance `%var`.",
  },
  {
    cuda: `  float rstd = rsqrtf(var + eps);`,
    ptx: `add.f32        %var, %var, 0f3727C5AC;   // eps     (0x3727C5AC ≈ 1e-5)
rsqrt.approx.f32 %s,  %var;`,
    explanation:
      "Adds the epsilon and computes the reciprocal square-root (`rsqrt.approx.f32`) \
       to get `rstd` (`%s`).",
  },

  /* ─────────────────────────────────────────────
     10. Final normalisation & affine transform
     ─────────────────────────────────────────── */
  {
    cuda: `  // --- Final Application ---`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  for (int i = tid; i < C; i += block_size) {`,
    ptx: `mov.s32 %i, %tidx;
bra $normalize_cond;`,
    explanation:
      "Third per-thread loop prologue: iterate over channels for output.",
  },
  {
    cuda: `    float n = (x[i] - mean) * rstd;`,
    ptx: `mad.wide.s32 %xi_ptr, %i, 4, %x_ptr;
ld.global.cs.f32 %xi, [%xi_ptr];
sub.f32           %n,  %xi, %m;
mul.f32           %n,  %n,  %s;`,
    explanation:
      "Loads `x[i]`, subtracts the mean, multiplies by `rstd` – computing the \
       normalised value `n`.",
  },
  {
    cuda: `    y[i] = n * weight[i] + bias[i];`,
    ptx: `mad.wide.s32 %weight_ptr_i, %i, 4, %weight_ptr;
ld.global.nc.f32  %weight_val, [%weight_ptr_i];
mad.wide.s32 %bias_ptr_i,   %i, 4, %bias_ptr;
ld.global.nc.f32  %bias_val,  [%bias_ptr_i];
fma.rn.f32        %n, %n, %weight_val, %bias_val;
mad.wide.s32 %out_ptr_i, %i, 4, %out_ptr;
st.global.cs.f32  [%out_ptr_i], %n;`,
    explanation:
      "Fetches the scale (`weight[i]`) and bias (`bias[i]`), performs \
       `n*weight + bias` with a fused‐multiply-add, and stores the result to `y[i]`.",
  },
  {
    cuda: `  }`,
    ptx: `add.s32 %i, %i, %ntidx;
$normalize_cond:
setp.lt.s32 %cond, %i, %C;
@%cond bra $normalize_loop;`,
    explanation:
      "Loop increment, condition test, and branch to iterate until `i ≥ C`.",
  },
  {
    cuda: `}`,
    ptx: `ret;`,
    explanation: "End of kernel: `ret` terminates the thread.",
  },
];

export const part5 = [
  /* ────────────────────────────────────
     warp-level reductions
     ─────────────────────────────────── */
  {
    cuda: `// warp‐level reductions`,
    ptx: `/* comment – no PTX */`,
    explanation: "Source comment only.",
  },

  {
    cuda: `__inline__ __device__ float warpReduceMax(float val) {`,
    ptx: `/* device function fully inlined; PTX appears inside caller */`,
    explanation:
      "Device function declaration; compiler inlines it, so no standalone PTX entry.",
  },
  {
    cuda: `  for (int offset = warpSize / 2; offset > 0; offset /= 2)`,
    ptx: `// see repeated shfl.sync.down & max.f32 inside softmax kernel`,
    explanation:
      "Loop header; realised by a sequence of `shfl.sync.down` + `max.f32` instructions.",
  },
  {
    cuda: `    val = max(val, __shfl_down_sync(0xffffffff, val, offset));`,
    ptx: `max.f32 & shfl.sync.down.b32`,
    explanation:
      "One iteration of the reduction: shuffle then take the maximum.",
  },
  {
    cuda: `  return val;`,
    ptx: `// value left in the same register`,
    explanation:
      "Return of inlined function – register already holds the result.",
  },
  { cuda: `}`, ptx: ``, explanation: "Close brace." },

  {
    cuda: ``,
    ptx: ``,
    explanation: "Blank line intentionally omitted from PTX.",
  },

  {
    cuda: `__inline__ __device__ float warpReduceSum(float val) {`,
    ptx: `/* inlined; implemented with shfl.sync.down + add.f32 */`,
    explanation: "Declaration of second device helper; likewise fully inlined.",
  },
  {
    cuda: `  for (int offset = warpSize / 2; offset > 0; offset /= 2)`,
    ptx: `// shfl.sync.down & add.f32 pattern`,
    explanation: "Loop header compiled to shuffle-addition ladder.",
  },
  {
    cuda: `    val += __shfl_down_sync(0xffffffff, val, offset);`,
    ptx: `add.f32 & shfl.sync.down.b32`,
    explanation: "Per-offset accumulation using shuffle + add.",
  },
  {
    cuda: `  return val;`,
    ptx: ``,
    explanation: "Return – value already in register.",
  },
  { cuda: `}`, ptx: ``, explanation: "Close brace." },

  /* ────────────────────────────────────
     block-wide reductions: max
     ─────────────────────────────────── */
  { cuda: ``, ptx: ``, explanation: "Blank line." },

  {
    cuda: `// block‐wide reductions (assumes blockDim.x ≤ 1024)`,
    ptx: ``,
    explanation: "Comment line.",
  },

  {
    cuda: `__inline__ __device__ float blockReduceMax(float val) {`,
    ptx: `/* inlined; shared memory + warp shuffles visible in PTX */`,
    explanation: "Start of blockReduceMax, inlined into kernel.",
  },
  {
    cuda: `  static __shared__ float shared[32];`,
    ptx: `.shared .align 4 .f32 shared_max[32];`,
    explanation:
      "Shared array allocation materialises as a static 32-float buffer.",
  },
  {
    cuda: `  int lane = threadIdx.x % warpSize;`,
    ptx: `rem.u32 %lane, %threadid, 32;`,
    explanation: "Compute lane id inside warp.",
  },
  {
    cuda: `  int wid = threadIdx.x / warpSize;`,
    ptx: `div.u32 %warp_id, %threadid, 32;`,
    explanation: "Compute warp id within block.",
  },

  {
    cuda: `  val = warpReduceMax(val); // Each warp finds its max`,
    ptx: `// the first shuffle-max ladder inside PTX`,
    explanation: "Calls the inlined warp reduction sequence.",
  },

  {
    cuda: `  if (lane == 0) {`,
    ptx: `setp.eq.u32 %guard, %lane, 0;`,
    explanation: "Predicate for lane-0 of each warp.",
  },
  {
    cuda: `    shared[wid] = val; // Warp leaders write their max to shared memory`,
    ptx: `st.shared.f32 [...]`,
    explanation: "Lane-0 stores per-warp result to shared memory.",
  },
  { cuda: `  }`, ptx: ``, explanation: "Close if." },
  {
    cuda: `  __syncthreads();`,
    ptx: `bar.sync 0;`,
    explanation: "Full-block barrier after first write.",
  },

  {
    cuda: `  // The first warp reduces the partial results from the warp leaders`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  val = (wid == 0) ? shared[lane] : -CUDART_INF_F;`,
    ptx: `setp.eq.u32 %guard, %warp_id, 0; ...`,
    explanation:
      "Only warp-0 threads read shared and others load -inf; realised with predicates and loads.",
  },
  {
    cuda: `  val = warpReduceMax(val);`,
    ptx: `// second shuffle-max ladder`,
    explanation:
      "Second warp-level reduction to combine the 32 partial maxima.",
  },

  {
    cuda: `  // --- THE CORRECT BROADCAST ---`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  // Only thread 0, which has the final answer, writes it to shared memory`,
    ptx: `setp.eq.u32 %guard, %threadid, 0;`,
    explanation: "Predicate for thread 0.",
  },
  {
    cuda: `  if (threadIdx.x == 0) {`,
    ptx: `@%guard st.shared.f32 [shared_max], %local_max;`,
    explanation: "Thread-0 stores the final max to shared[0].",
  },
  {
    cuda: `    shared[0] = val;`,
    ptx: ``,
    explanation: "Same store captured above.",
  },
  { cuda: `  }`, ptx: ``, explanation: "Close if." },
  {
    cuda: `  // All threads wait for that write to complete`,
    ptx: `bar.sync 0;`,
    explanation: "Barrier for broadcast.",
  },
  {
    cuda: `  // All threads now read the same, correct final value`,
    ptx: `ld.shared.f32 %local_max, [shared_max];`,
    explanation: "Load of the agreed-upon max.",
  },
  {
    cuda: `  return shared[0];`,
    ptx: `// value now in register`,
    explanation: "Return statement; value already loaded.",
  },
  { cuda: `}`, ptx: ``, explanation: "Close brace of blockReduceMax." },

  /* ────────────────────────────────────
     block-wide reductions: sum (similar pattern)
     ─────────────────────────────────── */
  { cuda: ``, ptx: ``, explanation: "Blank line." },

  {
    cuda: `__inline__ __device__ float blockReduceSum(float val) {`,
    ptx: `/* inlined; uses shared_sum[] buffer */`,
    explanation: "Start of blockReduceSum; pattern mirrors max version.",
  },
  {
    cuda: `  static __shared__ float shared[32];`,
    ptx: `.shared .align 4 .f32 shared_sum[32];`,
    explanation: "Shared buffer for partial sums.",
  },
  {
    cuda: `  int lane = threadIdx.x % warpSize;`,
    ptx: `rem.u32 %lane, %threadid, 32;`,
    explanation: "Compute lane id.",
  },
  {
    cuda: `  int wid = threadIdx.x / warpSize;`,
    ptx: `div.u32 %warp_id, %threadid, 32;`,
    explanation: "Compute warp id.",
  },
  {
    cuda: `  val = warpReduceSum(val); // Each warp finds its sum`,
    ptx: `// first shuffle-add ladder`,
    explanation: "Inlined warp sum reduction.",
  },
  {
    cuda: `  if (lane == 0) {`,
    ptx: `setp.eq.u32 %guard, %lane, 0;`,
    explanation: "Lane-0 predicate.",
  },
  {
    cuda: `    shared[wid] = val; // Warp leaders write their sum to shared memory`,
    ptx: `st.shared.f32 [...]`,
    explanation: "Store per-warp sum.",
  },
  { cuda: `  }`, ptx: ``, explanation: "Close if." },
  { cuda: `  __syncthreads();`, ptx: `bar.sync 0;`, explanation: "Barrier." },
  {
    cuda: `  val = (wid == 0) ? shared[lane] : 0.0f;`,
    ptx: `setp.eq.u32 %guard, %warp_id, 0; ...`,
    explanation: "Select shared value or zero depending on warp id.",
  },
  {
    cuda: `  val = warpReduceSum(val);`,
    ptx: `// second shuffle-add ladder`,
    explanation: "Second reduction within first warp.",
  },
  {
    cuda: `  // --- THE CORRECT BROADCAST ---`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  if (threadIdx.x == 0) {`,
    ptx: `setp.eq.u32 %guard, %threadid, 0;`,
    explanation: "Thread-0 predicate.",
  },
  {
    cuda: `    shared[0] = val;`,
    ptx: `@%guard st.shared.f32 [shared_sum], %local_sum;`,
    explanation: "Store final sum.",
  },
  { cuda: `  }`, ptx: ``, explanation: "Close if." },
  { cuda: `  __syncthreads();`, ptx: `bar.sync 0;`, explanation: "Barrier." },
  {
    cuda: `  return shared[0];`,
    ptx: `ld.shared.f32 %local_sum, [shared_sum];`,
    explanation: "All threads load the final sum and function returns.",
  },
  { cuda: `}`, ptx: ``, explanation: "Close brace of blockReduceSum." },

  /* ────────────────────────────────────
     softmax_fwd_kernel
     ─────────────────────────────────── */
  { cuda: ``, ptx: ``, explanation: "Blank line." },

  {
    cuda: `__global__ void`,
    ptx: `// cont’d on next line`,
    explanation: "Kernel keyword split across two lines; compiler joins.",
  },
  {
    cuda: `softmax_fwd_kernel(float *__restrict__ probs,        // [B*T][Vp]`,
    ptx: `.visible .entry softmax_fwd_kernel(`,
    explanation:
      "Kernel entry with pointer parameter `probs` becomes first `.u64` param.",
  },
  {
    cuda: `                   const float *__restrict__ logits, // [B*T][Vp]`,
    ptx: `  .param .u64 logits_param,`,
    explanation: "Second pointer param.",
  },
  {
    cuda: `                   int B, int T, int V, int Vp) {`,
    ptx: `  .param .u32 B_param, .param .u32 T_param, .param .u32 V_param, .param .u32 Vp_param )`,
    explanation: "Integer scalars become `.u32` params; opening brace.",
  },

  {
    cuda: `  int bt = blockIdx.x; // in [0..B*T)`,
    ptx: `mov.u32 %bt, %ctaid.x;`,
    explanation: "Block-index fetch.",
  },
  {
    cuda: `  int N = B * T;`,
    ptx: `mul.lo.u32 %N, %B, %T;`,
    explanation: "Product of B and T.",
  },
  {
    cuda: `  if (bt >= N)`,
    ptx: `setp.ge.s32 %guard, %bt, %N;`,
    explanation: "Guard predicate.",
  },
  {
    cuda: `    return;`,
    ptx: `@%guard bra $exit;`,
    explanation: "Early exit branch.",
  },

  { cuda: ``, ptx: ``, explanation: "Blank line." },

  {
    cuda: `  const float *logits_bt = logits + bt * Vp;`,
    ptx: `mad.wide.u32 %logits_bt, %bt_Vp, 4, %logits_ptr;`,
    explanation: "Row pointer for logits.",
  },
  {
    cuda: `  float *probs_bt = probs + bt * Vp;`,
    ptx: `mad.wide.u32 %probs_bt,  %bt_Vp, 4, %probs_ptr;`,
    explanation: "Row pointer for probs.",
  },

  { cuda: ``, ptx: ``, explanation: "Blank." },

  {
    cuda: `  int tid = threadIdx.x;`,
    ptx: `mov.u32 %threadid, %tid.x;`,
    explanation: "Thread ID.",
  },
  {
    cuda: `  int threads = blockDim.x;`,
    ptx: `mov.u32 %threads, %ntid.x;`,
    explanation: "Threads per block.",
  },

  /* 1) find max */
  { cuda: ``, ptx: ``, explanation: "Blank." },
  {
    cuda: `  // 1) find max over real vocab [0..V)`,
    ptx: `// find-max loop starts`,
    explanation: "Comment.",
  },
  {
    cuda: `  float local_max = -CUDART_INF_F;`,
    ptx: `mov.f32 %local_max, 0FFF800000;`,
    explanation: "Initialise to −inf.",
  },
  {
    cuda: `  for (int i = tid; i < V; i += threads) {`,
    ptx: `mov.u32 %idx, %threadid;`,
    explanation: "Loop set-up.",
  },
  {
    cuda: `    local_max = fmaxf(local_max, logits_bt[i]);`,
    ptx: `ld.global.f32 %logits_val, [...] ; max.f32 %local_max, %local_max, %logits_val;`,
    explanation: "Load and update per-thread max.",
  },
  {
    cuda: `  }`,
    ptx: `add.u32 %idx, %idx, %threads; ...`,
    explanation: "Loop increment/test compiled with branch back.",
  },
  {
    cuda: `  float maxval = blockReduceMax(local_max);`,
    ptx: `// block-wide max reduction sequence using shared_max`,
    explanation:
      "`blockReduceMax` inlined – first shared buffer reduction produces `%local_max` result broadcast to all.",
  },
  {
    cuda: `  __syncthreads();`,
    ptx: `bar.sync 0;`,
    explanation: "Barrier to ensure `shared_max` is visible.",
  },

  /* 2) exp + sum */
  { cuda: ``, ptx: ``, explanation: "Blank." },
  {
    cuda: `  // 2) compute exp(logit - maxval) and partial sum`,
    ptx: `// loop generating %local_sum`,
    explanation: "Comment.",
  },
  {
    cuda: `  float local_sum = 0.0f;`,
    ptx: `mov.f32 %local_sum, 0F00000000;`,
    explanation: "Initialise per-thread accumulator.",
  },
  {
    cuda: `  for (int i = tid; i < V; i += threads) {`,
    ptx: `mov.u32 %idx, %threadid;`,
    explanation: "Loop set-up for exp.",
  },
  {
    cuda: `    float e = expf(logits_bt[i] - maxval);`,
    ptx: `sub.f32 ... ; ex2.approx.ftz.f32`,
    explanation: "Subtract max, scale, and exponentiate using fast exp2.",
  },
  {
    cuda: `    probs_bt[i] = e;`,
    ptx: `st.global.f32 [...]`,
    explanation: "Write provisional probability.",
  },
  {
    cuda: `    local_sum += e;`,
    ptx: `add.f32 %local_sum, %local_sum, %logits_val;`,
    explanation: "Accumulate sum.",
  },
  {
    cuda: `  }`,
    ptx: `add.u32 %idx, %idx, %threads; ...`,
    explanation: "Loop increment/test.",
  },
  {
    cuda: `  float sum = blockReduceSum(local_sum);`,
    ptx: `// block-wide sum reduction using shared_sum`,
    explanation: "Inline `blockReduceSum` – shared buffer + shuffles.",
  },
  {
    cuda: `  __syncthreads();`,
    ptx: `bar.sync 0;`,
    explanation: "Barrier after sum reduction.",
  },

  { cuda: ``, ptx: ``, explanation: "Blank." },
  {
    cuda: `  float inv_sum = (sum > 0.0f ? 1.0f / sum : 0.0f);`,
    ptx: `setp.gt.f32 %guard, %local_sum, 0F00000000; ... rcp.approx.f32`,
    explanation: "Reciprocal guarded by predicate; zero if sum≤0.",
  },

  /* 3) normalise */
  { cuda: ``, ptx: ``, explanation: "Blank." },
  {
    cuda: `  // 3) normalize the real-vocab probabilities`,
    ptx: `// normalisation loop`,
    explanation: "Comment.",
  },
  {
    cuda: `  for (int i = tid; i < V; i += threads) {`,
    ptx: `mov.u32 %idx, %threadid;`,
    explanation: "Loop set-up.",
  },
  {
    cuda: `    probs_bt[i] *= inv_sum;`,
    ptx: `ld.global.f32 ... ; mul.f32 ; st.global.f32`,
    explanation: "Multiply by `inv_sum` and store.",
  },
  {
    cuda: `  }`,
    ptx: `add.u32 %idx, %idx, %threads; ...`,
    explanation: "Loop increment/test.",
  },

  /* 4) zero padding */
  {
    cuda: `  // 4) zero out the padded entries [V..Vp)`,
    ptx: `// zero-padding loop`,
    explanation: "Comment.",
  },
  {
    cuda: `  for (int i = V + tid; i < Vp; i += threads) {`,
    ptx: `add.u32 %idx, %V, %threadid;`,
    explanation: "Initial index for padding loop.",
  },
  {
    cuda: `    probs_bt[i] = 0.0f;`,
    ptx: `st.global.f32 [...] , 0F00000000;`,
    explanation: "Store zero.",
  },
  {
    cuda: `  }`,
    ptx: `add.u32 %idx, %idx, %threads; ...`,
    explanation: "Loop increment/test.",
  },

  {
    cuda: `}`,
    ptx: `$exit:\n  ret;`,
    explanation: "End of kernel – return instruction.",
  },
];

export const part6 = [
  /* ──────────────────────────────────────────
     Kernel signature & thread identifiers
     ───────────────────────────────────────── */
  {
    cuda: `__global__ void attention_fwd_kernel(float *out, float *preatt, float *att,`,
    ptx: `.visible .entry attention_fwd_kernel(
    .param .u64 out_param,
    .param .u64 preattn_param,
    .param .u64 attn_param,`,
    explanation:
      "First line of the kernel declaration.  Each pointer argument becomes a \
       64-bit parameter in the PTX entry list.",
  },
  {
    cuda: `                                     const float *inp, int B, int T, int C,`,
    ptx: `    .param .u64 inp_param,
    .param .u32 B_param,
    .param .u32 T_param,
    .param .u32 C_param,`,
    explanation:
      "Continuation of the parameter list: `inp` is a fourth 64-bit pointer; \
       the scalars `B, T, C` are 32-bit unsigned parameters.",
  },
  {
    cuda: `                                     int NH) {`,
    ptx: `    .param .u32 NH_param
)`,
    explanation:
      "Final scalar parameter `NH` (number of heads).  The closing parenthesis ends \
       the PTX entry header and the body begins next.",
  },

  /* comments about grid layout */
  {
    cuda: `  // Each thread block is for one head and one batch item: grid(NH, B)`,
    ptx: ``,
    explanation: "High-level comment only; no PTX emitted.",
  },
  {
    cuda: `  // Each thread is for one query token: block(T)`,
    ptx: ``,
    explanation: "Comment.",
  },

  /* thread indices */
  {
    cuda: `  int h = blockIdx.x;`,
    ptx: `mov.u32 %h, %ctaid.x;`,
    explanation: "`blockIdx.x` → head index `%h`.",
  },
  {
    cuda: `  int b = blockIdx.y;`,
    ptx: `mov.u32 %b, %ctaid.y;`,
    explanation: "`blockIdx.y` → batch index `%b`.",
  },
  {
    cuda: `  int t = threadIdx.x;`,
    ptx: `mov.u32 %t, %tid.x;`,
    explanation: "`threadIdx.x` → query-token index `%t`.",
  },

  /* guard */
  {
    cuda: ``,
    ptx: ``,
    explanation: "Blank line in source (ignored).",
  },
  {
    cuda: `  if (b >= B || h >= NH || t >= T)`,
    ptx: `setp.ge.u32 %cond, %b,  %B;  @%cond bra $exit;
setp.ge.u32 %cond, %h,  %NH; @%cond bra $exit;
setp.ge.u32 %cond, %t,  %T;  @%cond bra $exit;`,
    explanation:
      "Three comparisons compile to predicates that branch to `$exit` if any limit \
       is exceeded.",
  },
  {
    cuda: `    return;`,
    ptx: `// branch handled above`,
    explanation:
      "Early-return realised with the conditional branches already emitted.",
  },

  /* constants & scale */
  { cuda: ``, ptx: ``, explanation: "Blank line." },
  {
    cuda: `  int C3 = C * 3;`,
    ptx: `mul.lo.u32 %C3, %C, 3;`,
    explanation: "`C3` (3×C) in register `%C3`.",
  },
  {
    cuda: `  int hs = C / NH; // head size`,
    ptx: `div.u32 %hs, %C, %NH;`,
    explanation: "`hs` (head-size) via integer divide.",
  },
  {
    cuda: `  float scale = 1.0f / sqrtf((float)hs);`,
    ptx: `cvt.rn.f32.u32 %hs_f32, %hs;
sqrt.rn.f32     %hs_sqrt, %hs_f32;
rcp.rn.f32      %scale,   %hs_sqrt;`,
    explanation:
      "Convert `hs` to float, take square-root, then reciprocal → `scale`.",
  },

  /* pointer arithmetic: base addresses */
  { cuda: ``, ptx: ``, explanation: "Blank." },
  {
    cuda: `  // Pointer to the input for this batch item`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  const float *inp_b = inp + b * T * C3;`,
    ptx: `mul.lo.u32 %bT, %b, %T;
mul.lo.u32 %C3_x4, %C3, 4;
mad.wide.u32 %inp_b_ptr, %bT, %C3_x4, %inp_ptr;`,
    explanation:
      "Compute byte offset `(b*T*C3)*4` and add to `inp` base → `%inp_b_ptr`.",
  },
  {
    cuda: `  // Pointer to the query vector for this thread (b, t, h)`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  const float *query_t = inp_b + t * C3 + h * hs;`,
    ptx: `mad.wide.u32 %query_t_ptr, %t, %C3_x4, %inp_b_ptr;
mul.lo.u32  %hs_x4, %hs, 4;
mad.wide.u32 %query_t_ptr, %h, %hs_x4, %query_t_ptr;`,
    explanation:
      "Adds `(t*C3 + h*hs)` elements (each 4 bytes) to `%inp_b_ptr`, yielding \
       the query vector pointer.",
  },

  /* output row pointers */
  { cuda: ``, ptx: ``, explanation: "Blank." },
  {
    cuda: `  // Pointers to the output attention scores for this thread's row`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  float *preatt_bth = preatt + (b * NH * T * T) + (h * T * T) + (t * T);`,
    ptx: `mul.lo.u32 %TT, %T, %T;
mad.lo.u32  %b_NH_h, %b, %NH, %h;
mul.lo.u32  %b_NH_TT, %b_NH_h, %TT;
mad.lo.u32  %bth_offset, %t, %T, %b_NH_TT;
mad.wide.u32 %preatt_bth_ptr, %bth_offset, 4, %preattn_ptr;`,
    explanation:
      "Computes a linear offset (batch × heads × T²  +  t·T) then converts to bytes \
       and adds to `preatt` base.",
  },
  {
    cuda: `  float *att_bth = att + (b * NH * T * T) + (h * T * T) + (t * T);`,
    ptx: `mad.wide.u32 %att_bth_ptr, %bth_offset, 4, %attn_ptr;`,
    explanation: "Same offset reused for the `att` buffer.",
  },

  /* ──────────────────────  PASS 1  ────────────────────── */
  { cuda: ``, ptx: ``, explanation: "Blank." },
  {
    cuda: `  // --- Pass 1: Calculate Q.K^T and find maxval (causal attention) ---`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  // Each thread finds its OWN maxval, no block reduction needed.`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  float maxval = -10000.0f;`,
    ptx: `mov.f32 %maxval, 0fc61c4000;`,
    explanation: "Initialise max tracker to −10000 f.",
  },
  {
    cuda: `  for (int t2 = 0; t2 <= t; t2++) {`,
    ptx: `mov.u32 %t2, 0;  // loop setup`,
    explanation: "Outer loop over keys up to `t`.",
  },
  {
    cuda: `    // Pointer to the key vector for position t2`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `    const float *key_t2 = inp_b + t2 * C3 + h * hs + C; // +C offset for key`,
    ptx: `mad.lo.u32 %hhsC, %h, %hs, %C;          // h*hs + C
mad.lo.u32 %offset, %t2, %C3, %hhsC;   // t2*C3 + ...
mad.wide.u32 %key_t2_ptr, %offset, 4, %inp_b_ptr;`,
    explanation:
      "Builds the byte pointer for key vector at timestep `t2` (offset by +C for K).",
  },
  { cuda: ``, ptx: ``, explanation: "Blank." },
  { cuda: `    // Dot product`, ptx: ``, explanation: "Comment." },
  {
    cuda: `    float val = 0.0f;`,
    ptx: `mov.f32 %val, 0f00000000;`,
    explanation: "Accumulator for dot-product.",
  },
  {
    cuda: `    for (int i = 0; i < hs; i++) {`,
    ptx: `mov.u32 %i, 0;`,
    explanation: "Inner loop over head-size.",
  },
  {
    cuda: `      val += query_t[i] * key_t2[i];`,
    ptx: `mad.wide.u32 %query_ti_ptr, %i, 4, %query_t_ptr;
mad.wide.u32 %key_t2i_ptr, %i, 4, %key_t2_ptr;
ld.global.f32 %q_val,  [%query_ti_ptr];
ld.global.f32 %k_val,  [%key_t2i_ptr];
fma.rn.f32    %val, %q_val, %k_val, %val;`,
    explanation:
      "Fetch `Q[i]` and `K[i]`, perform fused-multiply-add into `val`.",
  },
  {
    cuda: `    }`,
    ptx: `add.u32 %i, %i, 1;
setp.lt.u32 %cond, %i, %hs;
@%cond bra $dot_product_loop;`,
    explanation: "Loop increment and test.",
  },
  {
    cuda: `    val *= scale;`,
    ptx: `mul.f32 %val, %val, %scale;`,
    explanation: "Apply scaling factor 1/√hs.",
  },
  {
    cuda: `    if (val > maxval) {`,
    ptx: `setp.gt.f32 %cond, %val, %maxval;`,
    explanation: "Compare to running max.",
  },
  {
    cuda: `      maxval = val;`,
    ptx: `@%cond mov.f32 %maxval, %val;`,
    explanation: "Update max when predicate true.",
  },
  { cuda: `    }`, ptx: ``, explanation: "Close `if`." },
  {
    cuda: `    preatt_bth[t2] = val;`,
    ptx: `mad.wide.u32 %preatt_bthi_ptr, %t2, 4, %preatt_bth_ptr;
st.global.f32 [%preatt_bthi_ptr], %val;`,
    explanation: "Store un-normalised attention score into `preatt` buffer.",
  },
  {
    cuda: `  }`,
    ptx: `add.u32 %t2, %t2, 1;
setp.le.u32 %cond, %t2, %t;
@%cond bra $pass1_loop;`,
    explanation: "End of outer loop.",
  },

  /* ──────────────────────  PASS 2  ────────────────────── */
  { cuda: ``, ptx: ``, explanation: "Blank." },
  {
    cuda: `  // --- Pass 2: Calculate exponentials and sum for the softmax denominator`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  // Each thread calculates its OWN sum, no block reduction.`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  float expsum = 0.0f;`,
    ptx: `mov.f32 %expsum, 0f00000000;`,
    explanation: "Init sum accumulator.",
  },
  {
    cuda: `  for (int t2 = 0; t2 <= t; t2++) {`,
    ptx: `mov.u32 %t2, 0;`,
    explanation: "Loop setup.",
  },
  {
    cuda: `    // Subtract maxval for numerical stability`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `    float expv = expf(preatt_bth[t2] - maxval);`,
    ptx: `mad.wide.u32 %preatt_bthi_ptr, %t2, 4, %preatt_bth_ptr;
ld.global.f32 %preatt_val, [%preatt_bthi_ptr];
sub.f32       %preatt_val, %preatt_val, %maxval;
mul.f32       %preatt_val, %preatt_val, 0f3fb8aa3b;
ex2.approx.ftz.f32 %expv, %preatt_val;`,
    explanation:
      "Loads raw score, subtracts max, scales log-e base to log-2, uses fast `ex2`.",
  },
  {
    cuda: `    expsum += expv;`,
    ptx: `add.f32 %expsum, %expsum, %expv;`,
    explanation: "Accumulate the sum.",
  },
  {
    cuda: `    att_bth[t2] = expv; // Store the numerator temporarily`,
    ptx: `mad.wide.u32 %att_bthi_ptr, %t2, 4, %att_bth_ptr;
st.global.f32 [%att_bthi_ptr], %expv;`,
    explanation: "Save numerator.",
  },
  {
    cuda: `  }`,
    ptx: `add.u32 %t2, %t2, 1;
setp.le.u32 %cond, %t2, %t;
@%cond bra $pass2_loop;`,
    explanation: "Loop end.",
  },
  {
    cuda: `  float expsum_inv = expsum == 0.0f ? 0.0f : 1.0f / expsum;`,
    ptx: `mov.f32 %expsum_inv, 0f00000000;
setp.eq.f32 %cond, %expsum, 0f00000000;
@!%cond rcp.rn.f32 %expsum_inv, %expsum;`,
    explanation: "Avoid divide-by-zero with predicate; otherwise reciprocal.",
  },

  /* ──────────────────────  PASS 3  ────────────────────── */
  { cuda: ``, ptx: ``, explanation: "Blank." },
  {
    cuda: `  // --- Pass 3: Normalize to get final softmax scores ---`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  for (int t2 = 0; t2 <= t; t2++) {`,
    ptx: `mov.u32 %t2, 0;`,
    explanation: "Loop over causal range again.",
  },
  {
    cuda: `    att_bth[t2] *= expsum_inv;`,
    ptx: `mad.wide.u32 %att_bthi_ptr, %t2, 4, %att_bth_ptr;
ld.global.f32 %att_val, [%att_bthi_ptr];
mul.f32       %att_val, %att_val, %expsum_inv;
st.global.f32 [%att_bthi_ptr], %att_val;`,
    explanation: "Multiply numerator by `1/sum` to obtain probability.",
  },
  {
    cuda: `  }`,
    ptx: `add.u32 %t2, %t2, 1;
setp.le.u32 %cond, %t2, %t;
@%cond bra $pass3_loop;`,
    explanation: "Loop end.",
  },
  {
    cuda: `  // Explicitly zero out future tokens`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  for (int t2 = t + 1; t2 < T; t2++) {`,
    ptx: `add.u32 %t2, %t, 1;  // start at t+1`,
    explanation: "Loop initialised to the first illegal (future) timestep.",
  },
  {
    cuda: `    att_bth[t2] = 0.0f;`,
    ptx: `mad.wide.u32 %att_bthi_ptr, %t2, 4, %att_bth_ptr;
st.global.f32 [%att_bthi_ptr], 0f00000000;`,
    explanation: "Write zero to padded position.",
  },
  {
    cuda: `  }`,
    ptx: `add.u32 %t2, %t2, 1;
setp.lt.u32 %cond, %t2, %T;
@%cond bra $zero_out_loop;`,
    explanation: "Loop end.",
  },

  /* ──────────────────────  PASS 4  ────────────────────── */
  { cuda: ``, ptx: ``, explanation: "Blank." },
  {
    cuda: `  // --- Pass 4: Accumulate weighted values into the output ---`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  float *out_bth = out + (b * T * C) + (t * C) + (h * hs);`,
    ptx: `mul.lo.u32 %tC, %t, %C;
mul.lo.u32 %bT, %b, %T;
mad.lo.u32 %bth_offset, %bT, %C, %tC;
mad.lo.u32 %bth_offset, %h, %hs, %bth_offset;
mad.wide.u32 %out_bth_ptr, %bth_offset, 4, %out_ptr;`,
    explanation: "Pointer to output vector for (b,t,h) query position.",
  },
  {
    cuda: `  for (int i = 0; i < hs; i++) {`,
    ptx: `mov.u32 %i, 0;`,
    explanation: "Initialise loop that zeroes output slice.",
  },
  {
    cuda: `    out_bth[i] = 0.0f;`,
    ptx: `mad.wide.u32 %out_bthi_ptr, %i, 4, %out_bth_ptr;
st.global.f32 [%out_bthi_ptr], 0f00000000;`,
    explanation: "Set element to zero.",
  },
  {
    cuda: `  }`,
    ptx: `add.u32 %i, %i, 1;
setp.lt.u32 %cond, %i, %hs;
@%cond bra $init_zero_loop;`,
    explanation: "End of zero-initialisation loop.",
  },
  {
    cuda: `  for (int t2 = 0; t2 <= t; t2++) {`,
    ptx: `mov.u32 %t2, 0;`,
    explanation: "Outer accumulation loop begins.",
  },
  {
    cuda: `    // Pointer to the value vector for position t2`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `    const float *value_t2 =`,
    ptx: `// address assembled in PTX just before inner loop`,
    explanation: "Line split continuation – see next entry.",
  },
  {
    cuda: `        inp_b + t2 * C3 + h * hs + C * 2; // +2C offset for value`,
    ptx: `shl.b32 %C2, %C, 1;            // 2*C
mad.lo.u32 %offset, %h, %hs, %C2;
mad.lo.u32 %value_t2_offset, %t2, %C3, %offset;
mad.wide.u32 %value_t2_ptr, %value_t2_offset, 4, %inp_b_ptr;`,
    explanation: "Pointer for the V (value) vector at `t2` (offset +2C).",
  },
  {
    cuda: `    float att_score = att_bth[t2];`,
    ptx: `mad.wide.u32 %att_bthi_ptr, %t2, 4, %att_bth_ptr;
ld.global.f32 %att_val_f32, [%att_bthi_ptr];`,
    explanation: "Load attention weight.",
  },
  {
    cuda: `    for (int i = 0; i < hs; i++) {`,
    ptx: `mov.u32 %i, 0;`,
    explanation: "Inner loop over head-size.",
  },
  {
    cuda: `      out_bth[i] += att_score * value_t2[i];`,
    ptx: `mad.wide.u32 %value_t2i_ptr, %i, 4, %value_t2_ptr;
ld.global.f32 %value_f32, [%value_t2i_ptr];
mad.wide.u32 %out_bthi_ptr, %i, 4, %out_bth_ptr;
ld.global.f32 %out_val_f32, [%out_bthi_ptr];
fma.rn.f32    %out_val_f32, %att_val_f32, %value_f32, %out_val_f32;
st.global.f32 [%out_bthi_ptr], %out_val_f32;`,
    explanation:
      "Fused multiply-add accumulates weighted value into the output slice.",
  },
  {
    cuda: `    }`,
    ptx: `add.u32 %i, %i, 1;
setp.lt.u32 %cond, %i, %hs;
@%cond bra $accumulate_inner_loop;`,
    explanation: "Inner loop close.",
  },
  {
    cuda: `  }`,
    ptx: `add.u32 %t2, %t2, 1;
setp.le.u32 %cond, %t2, %t;
@%cond bra $accumulate_loop;`,
    explanation: "Outer loop close.",
  },

  /* epilogue */
  {
    cuda: `}`,
    ptx: `$exit:\n  ret;`,
    explanation:
      "Closing brace – PTX label `$exit` and `ret` terminate the thread.",
  },
];

export const part7 = [
  /* ──────────────────────────────────────────
     Helpers (device functions, in-lined)
     ───────────────────────────────────────── */
  {
    cuda: `__device__ float4 ld_vec(const float *address) {`,
    ptx: `/* in-lined, uses ld.global.v4.f32 where called */`,
    explanation:
      "Device helper; compiler inlines it so there is no standalone PTX entry.",
  },
  {
    cuda: `  return *reinterpret_cast<const float4 *>(address);`,
    ptx: `ld.global.v4.f32`,
    explanation: "At call-sites this becomes a 128-bit vector load.",
  },
  { cuda: `}`, ptx: ``, explanation: "Close helper." },

  {
    cuda: `__device__ void st_vec(float *address, float4 val) {`,
    ptx: `/* in-lined, uses st.global.v4.f32 where called */`,
    explanation: "Store helper; likewise inlined.",
  },
  {
    cuda: `  *reinterpret_cast<float4 *>(address) = val;`,
    ptx: `st.global.v4.f32`,
    explanation: "128-bit store emitted at each call-site.",
  },
  { cuda: `}`, ptx: ``, explanation: "Close helper." },

  /* ──────────────────────────────────────────
     Kernel signature & launch bounds
     ───────────────────────────────────────── */
  {
    cuda: `__global__ void __launch_bounds__(16 * 16)`,
    ptx: `.visible .entry matmul_fwd_kernel ... .maxntid 256,1,1`,
    explanation:
      "`__launch_bounds__` informs the compiler; PTX shows `.maxntid 256,1,1` (16×16 threads = 256).",
  },
  {
    cuda: `    matmul_fwd_kernel(float *out, const float *inp, const float *weight,`,
    ptx: `.param .u64 out_param … weight_param`,
    explanation: "Pointer parameters become 64-bit `.u64` entry params.",
  },
  {
    cuda: `                      const float *bias, int C, int OC) {`,
    ptx: `.param .u64 bias_param, .param .u32 C_param, .param .u32 OC_param`,
    explanation: "Final pointer + two scalar ints complete the parameter list.",
  },

  /* Kernel-header comments (no PTX) */
  {
    cuda: `  // out is (B,T,OC). OC is short for "output channels", e.g. OC = 4 * C`,
    ptx: ``,
    explanation: "Comment only.",
  },
  {
    cuda: `  // inp is (B,T,C), weight is (OC, C), bias is (OC)`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  // each thread handles 8x8 elements; each block 128 by 128 elements.`,
    ptx: ``,
    explanation: "Comment.",
  },

  /* ------------------------------------------------------------------
     1.   Per-thread output-channel base  (oc = 8*(blockDim.y*blockIdx.y+threadIdx.y))
     ------------------------------------------------------------------ */
  {
    cuda: `  int oc = 8 * (blockIdx.y * blockDim.y + threadIdx.y);`,
    ptx: `mov %bidx_y …; mad.lo.u32 %oc, %bidx_y, %ntid.y, %tid.y; mul.lo.u32 %oc, %oc, 8;`,
    explanation: "Combines block and thread Y-indices, scales by 8.",
  },

  /* ------------------------------------------------------------------
     2.   Shared-memory declarations
     ------------------------------------------------------------------ */
  {
    cuda: `  // buffers to cache chunks of the input matrices`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  __shared__ float lhs_s[128][32];`,
    ptx: `.shared .align 4 .b8 lhs_shared[16384];`,
    explanation: "128×32 floats (16 KiB) reserved in shared memory.",
  },
  {
    cuda: `  __shared__ float rhs_s[128][32];`,
    ptx: `.shared .align 4 .b8 rhs_shared[16384];`,
    explanation: "Second 16 KiB shared buffer.",
  },

  /* ------------------------------------------------------------------
     3.   Block-level pointer adjustment
     ------------------------------------------------------------------ */
  {
    cuda: `  // adjust our pointers for the current block`,
    ptx: ``,
    explanation: "Comment.",
  },
  {
    cuda: `  inp += 128 * blockIdx.x * C;`,
    ptx: `mad.lo.u32 %inp_offset, %ctaid.x*128, %C; mad.wide.u32 …`,
    explanation: "Byte offset added to `%inp_ptr`.",
  },
  {
    cuda: `  weight += 128 * blockIdx.y * C;`,
    ptx: `mad.lo.u32 %weight_offset, %ctaid.y*128, %C …`,
    explanation: "Adjusts weight pointer for block’s column tile.",
  },
  {
    cuda: `  out += 128 * blockIdx.x * OC + 128 * blockIdx.y;`,
    ptx: `mad.lo.u32  … two-term address calc`,
    explanation: "Combines row and column tile offsets into output base.",
  },

  /* ------------------------------------------------------------------
     4.   Result tile initialisation (vals[8][8])
     ------------------------------------------------------------------ */
  {
    cuda: `  float vals[8][8] = {};`,
    ptx: `mov.f32 %vals1-%vals64, 0f00000000`,
    explanation: "64 floating registers zero-initialised.",
  },
  {
    cuda: `  if (bias != NULL) {`,
    ptx: `setp.ne.u64 %cond, %bias_ptr, 0; @!%cond bra after_bias;`,
    explanation: "Predicate skip when `bias==NULL`.",
  },
  {
    cuda: `    for (int i = 0; i < 8; i++) {`,
    ptx: `// bias loop unrolled by compiler`,
    explanation: "Eight identical blocks of vector loads and copies.",
  },
  {
    cuda: `      for (int j = 0; j < 8; j += 4) {`,
    ptx: `ld.global.v4.f32 …`,
    explanation: "Loads 4 bias values at a time.",
  },
  {
    cuda: `        float4 b = ld_vec(bias + oc + j);`,
    ptx: `ld.global.v4.f32`,
    explanation: "128-bit load of bias slice.",
  },
  {
    cuda: `        vals[i][j + 0] = b.x;`,
    ptx: `mov.f32`,
    explanation: "Scalar copy to register.",
  },
  {
    cuda: `        vals[i][j + 1] = b.y;`,
    ptx: `mov.f32`,
    explanation: "Copy.",
  },
  {
    cuda: `        vals[i][j + 2] = b.z;`,
    ptx: `mov.f32`,
    explanation: "Copy.",
  },
  {
    cuda: `        vals[i][j + 3] = b.w;`,
    ptx: `mov.f32`,
    explanation: "Copy.",
  },
  {
    cuda: `      }`,
    ptx: `/* loop indexing handled by compiler */`,
    explanation: "Inner bias loop end.",
  },
  { cuda: `    }`, ptx: `/* loop end */`, explanation: "Outer bias loop end." },
  { cuda: `  }`, ptx: `after_bias:`, explanation: "Predicate join." },

  /* ------------------------------------------------------------------
     5.   Main K-dimension loop
     ------------------------------------------------------------------ */
  {
    cuda: `  int si_start = 4 * (16 * threadIdx.y + threadIdx.x);`,
    ptx: `mad.lo.u32 %si_start, 16, %tid.y, %tid.x; mul.lo.u32 %si_start, %si_start, 4;`,
    explanation: "Starting slice index for this thread.",
  },
  {
    cuda: `  for (int so = 0; so < C; so += 32) {`,
    ptx: `mov.u32 %so,0;  loop_so: … add 32`,
    explanation: "`so` iterates over K in 32-element chunks.",
  },

  {
    cuda: `    __syncthreads();`,
    ptx: `bar.sync 0;`,
    explanation: "Barrier before loading new tiles.",
  },

  /* ------ 5a. Tile load into shared memory ------ */
  {
    cuda: `    int xmod8 = threadIdx.x % 8;`,
    ptx: `rem.u32 %xmod8, %tid.x, 8;`,
    explanation: "Remainder calc.",
  },
  {
    cuda: `    int xby8 = threadIdx.x / 8;`,
    ptx: `shr.b32 %xby8, %tid.x, 3;`,
    explanation: "Division by 8 via shift.",
  },
  {
    cuda: `    int xo = 4 * xmod8;`,
    ptx: `mul.lo.u32 %xo, %xmod8, 4;`,
    explanation: "Byte offset within row (4 floats).",
  },
  {
    cuda: `    for (int y = 2 * threadIdx.y + xby8; y < 128; y += 32) {`,
    ptx: `loop_y: … add.y 32`,
    explanation: "Each thread stores multiple rows of both tiles.",
  },
  {
    cuda: `      st_vec(&lhs_s[y][xo], ld_vec(inp + y * C + so + xo));`,
    ptx: `ld.global.v4.f32 …; st.shared.v4.f32 …`,
    explanation: "Vector load from global; vector store to `lhs_shared`.",
  },
  {
    cuda: `      st_vec(&rhs_s[y][xo], ld_vec(weight + y * C + so + xo));`,
    ptx: `ld.global.v4.f32 …; st.shared.v4.f32 …`,
    explanation: "Same for RHS tile.",
  },
  { cuda: `    }`, ptx: `/* y-loop end */`, explanation: "Y-loop concludes." },
  {
    cuda: `    __syncthreads();`,
    ptx: `bar.sync 0;`,
    explanation: "Ensure tiles are fully in shared memory.",
  },

  /* ------ 5b. Compute 32-column micro-tile ------ */
  {
    cuda: `    for (int si = si_start; si < si_start + 32; si += 4) {`,
    ptx: `loop_si: … add 4`,
    explanation: "`si` selects slices (4 columns) inside the 32-element tile.",
  },
  {
    cuda: `      float4 rhs[8];`,
    ptx: `/* eight ld.shared.v4.f32 into %rhs_s#_* registers */`,
    explanation: "Loads an 8-vector column block from `rhs_shared`.",
  },
  {
    cuda: `      for (int u = 0; u < 8; ++u) {`,
    ptx: `/* unrolled, 8 vector loads */`,
    explanation: "Compiler unrolls the loop entirely.",
  },
  {
    cuda: `        rhs[u] = ld_vec(&rhs_s[u + 8 * threadIdx.y][si % 32]);`,
    ptx: `ld.shared.v4.f32`,
    explanation: "Load into registers.",
  },
  {
    cuda: `      }`,
    ptx: `/* u-loop end */`,
    explanation: "End of RHS load loop.",
  },

  {
    cuda: `      for (int ii = 0; ii < 8; ++ii) {`,
    ptx: `/* inner ii loop fully unrolled */`,
    explanation: "Eight rows processed, fully unrolled.",
  },
  {
    cuda: `        float4 lhs = ld_vec(&lhs_s[ii + 8 * threadIdx.x][si % 32]);`,
    ptx: `ld.shared.v4.f32`,
    explanation: "Load LHS vector for row `ii`.",
  },
  {
    cuda: `        for (int ji = 0; ji < 8; ++ji) {`,
    ptx: `/* 8 × 4 = 32 multiply-adds per row */`,
    explanation: "Inner-most accumulation loop unrolled.",
  },
  {
    cuda: `          vals[ii][ji] += lhs.x * rhs[ji].x;`,
    ptx: `fma.rn.f32 %vals…, %lhs_1, %rhs_s#_1, %vals…`,
    explanation:
      "Four fused multiply-adds per *ji*; compiler emits 256 FMA per `si` slice.",
  },
  {
    cuda: `          vals[ii][ji] += lhs.y * rhs[ji].y;`,
    ptx: `/* many fma.rn.f32 … (see PTX) */`,
    explanation: "Continuation of FMA chain.",
  },
  {
    cuda: `          vals[ii][ji] += lhs.z * rhs[ji].z;`,
    ptx: `/* many fma.rn.f32 … */`,
    explanation: "Same.",
  },
  {
    cuda: `          vals[ii][ji] += lhs.w * rhs[ji].w;`,
    ptx: `/* many fma.rn.f32 … */`,
    explanation: "Same.",
  },
  {
    cuda: `        }`,
    ptx: `/* ji-loop end */`,
    explanation: "Finish accumulation for this row.",
  },
  {
    cuda: `      }`,
    ptx: `/* ii-loop end */`,
    explanation: "Finish 8-row micro-tile.",
  },
  {
    cuda: `    }`,
    ptx: `add.u32 %si, … ; @cmp bra loop_si`,
    explanation: "Advance `si` by 4 until 32 columns consumed.",
  },
  {
    cuda: `  }`,
    ptx: `add.u32 %so, 32 ; @cmp bra loop_so`,
    explanation: "Advance `so` to next K-tile (32 columns) until `C` done.",
  },

  /* ------------------------------------------------------------------
     6.   Write the 8×8 result tile back to global
     ------------------------------------------------------------------ */
  {
    cuda: `  for (int i = 0; i < 8; ++i) {`,
    ptx: `/* eight store pairs, unrolled */`,
    explanation: "Compiler writes two `st.global.v4.f32` per row (8 floats).",
  },
  {
    cuda: `    for (int j = 0; j < 8; j += 4) {`,
    ptx: `/* j loop unrolled (j=0,4) */`,
    explanation: "Two vector stores each row.",
  },
  {
    cuda: `      float4 result;`,
    ptx: `// values already scattered in %vals registers`,
    explanation: "Temporary struct mapped to registers.",
  },
  {
    cuda: `      result.x = vals[i][j + 0];`,
    ptx: `mov`,
    explanation: "Pack registers for store.",
  },
  {
    cuda: `      result.y = vals[i][j + 1];`,
    ptx: `mov`,
    explanation: "Pack.",
  },
  {
    cuda: `      result.z = vals[i][j + 2];`,
    ptx: `mov`,
    explanation: "Pack.",
  },
  {
    cuda: `      result.w = vals[i][j + 3];`,
    ptx: `mov`,
    explanation: "Pack.",
  },
  {
    cuda: `      st_vec(out + (8 * threadIdx.x + i) * OC + 8 * threadIdx.y + j, result);`,
    ptx: `st.global.v4.f32`,
    explanation: "128-bit store of one 4-float slice.",
  },
  {
    cuda: `    }`,
    ptx: `/* j-loop end */`,
    explanation: "End inner store loop.",
  },
  {
    cuda: `  }`,
    ptx: `/* i-loop end */`,
    explanation: "Finished all 64 result elements.",
  },

  /* ------------------------------------------------------------------
     7.   Kernel epilogue
     ------------------------------------------------------------------ */
  { cuda: `}`, ptx: `ret;`, explanation: "Kernel return." },
];

// A simple regex-based highlighter for CUDA C++
const CudaHighlighter = ({ code }) => {
  const highlight = (text) => {
    let highlighted = text;
    // Keywords
    highlighted = highlighted.replace(
      /\b(__global__|void|const|int|float|return)\b/g,
      '<span class="text-purple-400">$1</span>',
    );
    // Types and pointers
    highlighted = highlighted.replace(
      /\b(float\s*\*)/g,
      '<span class="text-teal-300">$1</span>',
    );
    // Comments
    highlighted = highlighted.replace(
      /(\/\/.+)/g,
      '<span class="text-gray-500">$1</span>',
    );
    // Restrict keyword
    highlighted = highlighted.replace(
      /(__restrict__)/g,
      '<span class="text-red-400">$1</span>',
    );
    return { __html: highlighted };
  };

  return (
    <pre
      className="whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={highlight(code)}
    />
  );
};

// A simple regex-based highlighter for PTX Assembly
const PtxHighlighter = ({ code }) => {
  const highlight = (text) => {
    let highlighted = text;
    // Directives
    highlighted = highlighted.replace(
      /(\.(?:visible|entry|param|reg|version|target|address_size))/g,
      '<span class="text-purple-400">$1</span>',
    );
    // Instructions (ld, st, mov, mad, etc.)
    highlighted = highlighted.replace(
      /\b(ld|st|mov|mad|setp|bra|add|mul|cvta|ret)\.[\w.]+\b/g,
      '<span class="text-sky-400">$&</span>',
    );
    // Registers
    highlighted = highlighted.replace(
      /(%[\w.]+)/g,
      '<span class="text-yellow-400">$1</span>',
    );
    // Types
    highlighted = highlighted.replace(
      /\.u32|\.u64|\.b32|\.b64|\.f32|\.s32/g,
      '<span class="text-teal-300">$&</span>',
    );
    // Labels
    highlighted = highlighted.replace(
      /(\$\w+:)/g,
      '<span class="text-red-400">$1</span>',
    );
    return { __html: highlighted };
  };

  return (
    <pre
      className="whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={highlight(code)}
    />
  );
};

// Component to parse explanations and highlight inline code
const Explanation = ({ text }) => {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <p className="text-gray-300 leading-relaxed">
      {parts.map((part, i) =>
        part.startsWith("`") ? (
          <code
            key={i}
            className="bg-gray-700 text-cyan-300 font-mono rounded-md px-1.5 py-0.5 mx-0.5"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </p>
  );
};

// --- Main App Component ---
export function App({ part }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <main>
      {/* Header Row for larger screens */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-x-6 font-mono text-base font-semibold border-b-2 border-gray-700 pb-3 mb-4">
        <div className="lg:col-span-3 text-green-400">CUDA C++</div>
        <div className="lg:col-span-3 text-yellow-400">PTX Assembly</div>
        <div className="lg:col-span-4 text-blue-400">Explanation</div>
      </div>

      <div className="space-y-1">
        {part.map((item, index) => (
          <div className="m-0 p-0">
            <div
              key={index}
              className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-x-6  rounded-lg transition-all duration-300 ease-out"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Glow effect on hover */}
              <div
                className={`absolute inset-0 rounded-xl border border-transparent transition-all duration-300 ${hoveredIndex === index ? "border-cyan-500/50 bg-gray-800/50 shadow-2xl shadow-cyan-500/10" : ""}`}
              ></div>

              {/* CUDA Column */}
              <div className="relative lg:col-span-3">
                <div className="md:hidden text-sm font-bold text-green-400 mb-2">
                  CUDA C++
                </div>
                <div className="font-mono text-sm p-3 rounded-md h-full flex flex-col justify-center text-green-300">
                  <CudaHighlighter code={item.cuda} />
                </div>
              </div>

              {/* PTX Column */}
              <div className="relative lg:col-span-3">
                <div className="md:hidden text-sm font-bold text-yellow-400 mb-2">
                  PTX Assembly
                </div>
                <div className="font-mono text-sm p-3 rounded-md h-full flex flex-col justify-center text-yellow-300">
                  <PtxHighlighter code={item.ptx} />
                </div>
              </div>

              {/* Explanation Column */}
              <div className="relative lg:col-span-4">
                <div className="md:hidden text-sm font-bold text-blue-400 mb-2">
                  Explanation
                </div>
                <div className="h-full flex items-center">
                  <Explanation text={item.explanation} />
                </div>
              </div>
            </div>
            <hr className="border-gray-700" style={{ margin: 0 }} />
          </div>
        ))}
      </div>
    </main>
  );
}
