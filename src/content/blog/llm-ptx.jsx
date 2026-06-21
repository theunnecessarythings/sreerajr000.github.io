import React, { useState } from "react";

export const part1 = [
  {
    cuda: `__global__ void residual_fwd_kernel(float *out,
                                     const float *inp1,
                                     const float *inp2, int N)`,
    ptx: `.visible .entry residual_fwd_kernel(
	.param .u64 out_param,
	.param .u64 inp1_param,
	.param .u64 inp2_param,
	.param .u32 N_param
)`,
    explanation:
      "This section declares the CUDA kernel `residual_fwd_kernel` and its parameters. In PTX, this translates to defining a visible entry point (`.visible .entry`) with corresponding parameters. The pointers (`out`, `inp1`, `inp2`) are passed as 64-bit unsigned integers (`.u64`), and the integer `N` is passed as a 32-bit unsigned integer (`.u32`).",
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
    cuda: `// Load parameters`,
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
      "This calculates the unique global index `i` for each thread. It uses special registers like `%ctaid.x` (block ID) and `%tid.x` (thread ID), then performs a fused `mad.lo.s32` (Multiply-Add Low) instruction: `%idx = %blockid_x * %blockdim_x + %tid_x`. This is a common pattern in CUDA to compute the global thread index. `NOTE`: registers like `%ctaid.x`, `%ntid.x`, and `%tid.x` are special registers that hold the block ID, block dim, and thread ID, respectively and we need to move it to local registers before using it in arithmetic operations.",
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
      " `PART 1`: `cvta.to.global` converts the pointer to global address space. The `mul.wide.s32` instruction computes the byte offset for the index `%idx` (multiplied by 4, since each float is 4 bytes). The `add.s64` instruction adds this offset to the base address of each input array to get the addresses for `inp1[i]` and `inp2[i]`. This is a common pattern in CUDA to access array elements based on a computed index.",
  },
  {
    cuda: `// (cont'd)`,
    ptx: `	ld.global.nc.f32 	%inp1_i, [%inp1_i_addr];
	ld.global.nc.f32 	%inp2_i, [%inp2_i_addr];`,
    explanation:
      "PART 2: Loading Data. The `ld.global.nc.f32` instruction loads a 32-bit float from global memory into a register. The `.nc` suffix is a cache hint ('non-coherent', Don't ask me too much, I am new here).",
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
    ptx: `// The value √(2/π) ≃ 0.7978846f appears later as the
       32-bit hex literal 0F3f4c4229 in:
           mul.f32 %tmp4, 0F3f4c4229, %tmp3;`,
    explanation:
      "The macro is resolved at compile-time in the case of CUDA. So for PTX, we baked the numeric value √(2/π) directly into an instruction as the \
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
       At this point I wasn't aware of the `fma` instruction (fused multiply-add, similar to mad, but for floats). Otherwise, we could have used it.",
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
    cuda: `  if (b < B && t < T && c_start < C) {`,
    ptx: `setp.lt.u32 %p_guard, %r_c_start_elems, %r_C;
@!%p_guard bra EXIT;`,
    explanation:
      "The compiler relies on the launch configuration to guarantee `b < B` and \
       `t < T`, so only `c_start < C` is really needed. `setp.lt.u32` sets `%p_guard` if \
       the condition is **true**.  The NOT predicate (`@!%p_guard`) branches to \
       `EXIT` when the condition fails, mimicking the high-level `if`.",
  },

  /* ─────────────────────────────────────────────
     Token id lookup
     ─────────────────────────────────────────── */
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
    cuda: `    const float4 *wte_ptr = reinterpret_cast<const float4 *>(wte_row + c_start);`,
    ptx: ``,
    explanation:
      "No direct PTX is needed; the address computed earlier (`%r_wte_offset_elems`) \
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
       allocated for the running sums of *x* and *x²*. 128 bytes is enough for 32 floats (32 * 4 = 128).  The `.align 4` directive ensures 4-byte alignment. \
    ",
  },

  /* ─────────────────────────────────────────────
     2. Shared buffer declaration
     ─────────────────────────────────────────── */
  {
    cuda: `  extern __shared__ float shared_buffer[];`,
    ptx: `// handled by the two .shared declarations above`,
    explanation:
      "`extern __shared__` requests dynamic shared memory, but we replaced \
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
    ptx: `// stores only warp-leader results:
setp.eq.s32 %cond, %lane_id, 0;
@!%cond bra $after_shared_write;
mad.lo.s32 %shared_sum_ptr, %warp_id, 4, %shared_sum;
st.shared.f32 [%shared_sum_ptr], %thread_sum;
$after_shared_write:`,
    explanation:
      "Rather than every thread writing, the we perform an intra-warp reduction \
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
    cuda: `  for (int stride = block_size / 2; stride > 0; stride >>= 1) {`,
    ptx: `// implemented in two levels:
  // 1) intra-warp shuffle (already done)
  // 2) warp-leaders read & reduce again (below)`,
    explanation:
      "The high-level shared-memory reduction is translated into a second warp-level \
       `shfl.sync.down` reduction across the warp-leader values that were written to \
       shared memory.",
  },
  {
    cuda: `    if (tid < stride) {`,
    ptx: ``,
    explanation:
      "Predicate tests inside the CUDA loop disappear because the  \
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
    ptx: `// Not needed; we use warp-level ops, then one barrier later.`,
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
    cuda: `  for (int stride = block_size / 2; stride > 0; stride >>= 1) {`,
    ptx: `// translated into a second warp-shuffle reduction (see PTX around $warp_reduce_loop2)`,
    explanation:
      "As with the mean, the loop is lowered to warp-level shuffles + one barrier.",
  },
  {
    cuda: `    if (tid < stride) {`,
    ptx: ``,
    explanation: "Removed. Similar to the mean reduction",
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
   // warp-level reductions
   // ─────────────────────────────────── */
  {
    cuda: `__inline__ __device__ float warpReduceMax(float val) {`,
    ptx: `/* (no direct equivalent) */`,
    explanation:
      "This is a device function declaration. Because it is `__inline__`, we will insert its code directly into any function that calls it.",
  },
  {
    cuda: `  for (int offset = warpSize / 2; offset > 0; offset /= 2)`,
    ptx: `mov.u32 %offset, 16;\n$warp_reduce_max:\n  /* ... body ... */\n  shr.u32 %offset, %offset, 1;\n  setp.gt.u32 %guard, %offset, 0;\n  @%guard bra $warp_reduce_max;`,
    explanation:
      "The start of a loop. In PTX, this is implemented by initializing an `%offset` register to 16 (`warpSize/2`), executing the loop body, and then using a conditional branch (`bra`) to repeat. This loop is fully unrolled.",
  },
  {
    cuda: `    val = max(val, __shfl_down_sync(0xffffffff, val, offset));`,
    ptx: `shfl.sync.down.b32 %r_shuffled_bits, %local_max, %offset, 0x1f, 0xffffffff;\nmax.f32 %local_max, %local_max, %r_shuffled_bits;`,
    explanation:
      "`__shfl_down_sync` retrieves a value from another thread in the warp, `offset` lanes down. This directly maps to the `shfl.sync.down.b32` instruction. The result is then compared with the thread's current value using `max.f32`.",
  },
  {
    cuda: `  return val;`,
    ptx: `/* (no direct equivalent) */`,
    explanation:
      "Since the function is inlined, there is no explicit `ret` instruction here. The final reduced value is simply left in the `%local_max` register for the subsequent instructions to use.",
  },
  {
    cuda: `}`,
    ptx: ``,
    explanation: "End of the `warpReduceMax` device function.",
  },
  {
    cuda: `__inline__ __device__ float warpReduceSum(float val) {`,
    ptx: `/* (no direct equivalent) */`,
    explanation:
      "Declaration for the `warpReduceSum` device function. This is also inlined into the main kernel code.",
  },
  {
    cuda: `  for (int offset = warpSize / 2; offset > 0; offset /= 2)`,
    ptx: `mov.u32 %offset, 16;\n$warp_reduce_sum:\n  /* ... body ... */\n  shr.u32 %offset, %offset, 1;\n  setp.gt.u32 %guard, %offset, 0;\n  @%guard bra $warp_reduce_sum;`,
    explanation:
      "The loop structure for the sum reduction, identical to the max reduction. It is also unrolled.",
  },
  {
    cuda: `    val += __shfl_down_sync(0xffffffff, val, offset);`,
    ptx: `shfl.sync.down.b32 %r_shuffled_bits, %local_sum, %offset, 0x1f, 0xffffffff;\nadd.f32 %local_sum, %local_sum, %r_shuffled_bits;`,
    explanation:
      "A value is shuffled down from a neighboring thread, and then `add.f32` is used to add it to the current thread's running sum, stored in `%local_sum`.",
  },
  {
    cuda: `  return val;`,
    ptx: `/* (no direct equivalent) */`,
    explanation:
      "Return of the inlined function. The final sum is held in the `%local_sum` register.",
  },
  {
    cuda: `}`,
    ptx: ``,
    explanation: "End of the `warpReduceSum` device function.",
  },

  /* ────────────────────────────────────
   // block-wide reductions
   // ─────────────────────────────────── */
  {
    cuda: `__inline__ __device__ float blockReduceMax(float val) {`,
    ptx: `/* (no direct equivalent) */`,
    explanation:
      "Start of the `blockReduceMax` inlined device function. Its logic will appear directly within the `softmax_fwd_kernel`.",
  },
  {
    cuda: `  static __shared__ float shared[32];`,
    ptx: `.shared .align 4 .f32 shared_max[32];`,
    explanation:
      "Declaration of a shared memory array. The PTX `.shared` directive allocates 32 floats (128 bytes) in the shared memory space, named `shared_max`.",
  },
  {
    cuda: `  int lane = threadIdx.x % warpSize;`,
    ptx: `rem.u32 %lane, %threadid, 32;`,
    explanation:
      "The thread's lane index within its warp is calculated using the remainder (`rem.u32`) of the thread ID divided by the warp size (32).",
  },
  {
    cuda: `  int wid = threadIdx.x / warpSize;`,
    ptx: `div.u32 %warp_id, %threadid, 32;`,
    explanation:
      "The warp's index within the thread block is calculated using integer division (`div.u32`).",
  },
  {
    cuda: `  val = warpReduceMax(val); // Each warp finds its max`,
    ptx: `/* First warp_reduce_max ladder */\nmov.u32 %offset, 16;\n$warp_reduce_max:\n  shfl.sync.down.b32 ...\n  max.f32 ...\n  @%guard bra $warp_reduce_max;`,
    explanation:
      "This calls the inlined `warpReduceMax` function. In the PTX, this corresponds to the first unrolled loop of `shfl` and `max` instructions.",
  },
  {
    cuda: `  if (lane == 0) {`,
    ptx: `setp.eq.u32 %guard, %lane, 0;`,
    explanation:
      "A predicate register `%guard` is set to true only for threads where the lane index is 0 (the 'leader' of each warp).",
  },
  {
    cuda: `    shared[wid] = val; // Warp leaders write their max to shared memory`,
    ptx: `mov.u64 %shared_max_ptr, shared_max;\nmad.wide.u32 %shared_max_ptr, %warp_id, 4, %shared_max_ptr;\n@%guard st.shared.f32 [%shared_max_ptr], %local_max;`,
    explanation:
      "The warp leader (where `@%guard` is true) writes its warp's maximum value to the shared memory array. The address `shared[wid]` is calculated with a `mad.wide.u32` (fused multiply-add).",
  },
  { cuda: `  }`, ptx: ``, explanation: "End of the if-statement block." },
  {
    cuda: `  __syncthreads();`,
    ptx: `bar.sync 0;`,
    explanation:
      "A barrier synchronization. All threads in the block must reach this point before any thread can proceed. This ensures all warp leaders have written to shared memory.",
  },
  {
    cuda: `  val = (wid == 0) ? shared[lane] : -CUDART_INF_F;`,
    ptx: `setp.eq.u32 %guard, %warp_id, 0;\nmov.f32 %local_max, 0FFF800000;\n@%guard ld.shared.f32 %local_max, [%shared_max_ptr];`,
    explanation:
      "This ternary operation is split into multiple instructions. First, `%local_max` is reset to -infinity for all threads. Then, only the threads in the first warp (`wid == 0`) load the partial results from the shared memory array into their `%local_max` register.",
  },
  {
    cuda: `  val = warpReduceMax(val);`,
    ptx: `/* Second warp_reduce_max ladder */\nmov.u32 %offset, 16;\n$warp_reduce_max2:\n ...`,
    explanation:
      "A second warp reduction is performed. This time, only the first warp is active, reducing the 32 partial maximums to a single block-wide maximum.",
  },

  {
    cuda: `  // Only thread 0, which has the final answer, writes it to shared memory`,
    ptx: `setp.eq.u32 %guard, %threadid, 0;`,
    explanation:
      "A predicate is set, this time for the single thread with `threadIdx.x == 0`.",
  },
  {
    cuda: `  if (threadIdx.x == 0) {`,
    ptx: `@%guard st.shared.f32 [%shared_max_ptr], %local_max;`,
    explanation:
      "Thread 0, which now holds the final block-wide maximum in its `%local_max` register, writes this value to the first element of the shared memory array.",
  },
  {
    cuda: `    shared[0] = val;`,
    ptx: `/* (Combined with the if statement above) */`,
    explanation:
      "The body of the if-statement; the PTX instruction `st.shared.f32` performs this store.",
  },
  {
    cuda: `  // All threads wait for that write to complete`,
    ptx: `bar.sync 0;`,
    explanation:
      "A second barrier synchronization. This ensures that thread 0's write to `shared[0]` is complete before any other thread tries to read it.",
  },
  {
    cuda: `  // All threads now read the same, correct final value`,
    ptx: `ld.shared.f32 %local_max, [shared_max];`,
    explanation:
      "All threads in the block load the final maximum value from `shared_max[0]` into their local `%local_max` register, effectively broadcasting the result.",
  },
  {
    cuda: `  return shared[0];`,
    ptx: `/* (no direct equivalent) */`,
    explanation:
      "The broadcast is complete. The return value is now in the `%local_max` register for every thread.",
  },
  { cuda: `}`, ptx: ``, explanation: "End of `blockReduceMax`." },
  {
    cuda: `__inline__ __device__ float blockReduceSum(float val) {`,
    ptx: `.shared .align 4 .f32 shared_sum[32];`,
    explanation:
      "The start of the `blockReduceSum` function, which is also inlined. A separate shared memory array, `shared_sum`, is allocated for this reduction.",
  },
  {
    cuda: `/* (The implementation mirrors blockReduceMax exactly, using warpReduceSum and 0.0f as the identity) */`,
    ptx: `/* (The PTX implementation mirrors the block-reduce-max logic, but uses add.f32 instead of max.f32 and 0.0 instead of -inf) */`,
    explanation:
      "The structure of `blockReduceSum` is identical to `blockReduceMax`. It performs a warp-level sum, has warp leaders write to shared memory, synchronizes, has warp 0 sum the partial results, and then broadcasts the final sum. The PTX is analogous, replacing `max.f32` with `add.f32` and `-inf` with `0.0f`.",
  },

  /* ────────────────────────────────────
   // softmax_fwd_kernel
   // ─────────────────────────────────── */
  {
    cuda: `__global__ void\nsoftmax_fwd_kernel(float *__restrict__ probs,`,
    ptx: `.visible .entry softmax_fwd_kernel(\n\t.param .u64 probs_param,`,
    explanation:
      "The global kernel definition. The `probs` pointer argument becomes a 64-bit parameter (`.param .u64`) in PTX.",
  },
  {
    cuda: `                     const float *__restrict__ logits,`,
    ptx: `\t.param .u64 logits_param,`,
    explanation:
      "The `logits` pointer argument similarly becomes a 64-bit parameter.",
  },
  {
    cuda: `                     int B, int T, int V, int Vp) {`,
    ptx: `\t.param .u32 B_param, ... )`,
    explanation:
      "The integer scalar arguments `B, T, V, Vp` become 32-bit parameters.",
  },
  {
    cuda: `  int bt = blockIdx.x; // in [0..B*T)`,
    ptx: `mov.u32 %bt, %ctaid.x;`,
    explanation:
      "The block index `blockIdx.x` is read from the special register `%ctaid.x` and moved into the register `%bt`.",
  },
  {
    cuda: `  int N = B * T;`,
    ptx: `mul.lo.u32 %N, %B, %T;`,
    explanation:
      "The total number of batches/sequences `N` is calculated by multiplying (`mul.lo.u32`) the B and T parameters.",
  },
  {
    cuda: `  if (bt >= N)`,
    ptx: `setp.ge.s32 %guard, %bt, %N;`,
    explanation:
      "A predicate `%guard` is set to true if the current block's index `bt` is greater than or equal to `N`.",
  },
  {
    cuda: `    return;`,
    ptx: `@%guard bra $exit;`,
    explanation:
      "If the guard predicate is true, the thread block is outside the problem bounds, so we branch (`bra`) directly to the exit label.",
  },
  {
    cuda: `  const float *logits_bt = logits + bt * Vp;`,
    ptx: `mul.lo.u32 %bt_Vp, %bt, %Vp;\nmad.wide.u32 %logits_bt, %bt_Vp, 4, %logits_ptr;`,
    explanation:
      "Calculates the base address for the current row of logits. `bt` and `Vp` are multiplied, then that offset (times 4 bytes) is added to the base `logits_ptr`.",
  },
  {
    cuda: `  float *probs_bt = probs + bt * Vp;`,
    ptx: `mad.wide.u32 %probs_bt, %bt_Vp, 4, %probs_ptr;`,
    explanation:
      "Calculates the base address for the current row of probabilities in the same way.",
  },
  {
    cuda: `  int tid = threadIdx.x;`,
    ptx: `mov.u32 %threadid, %tid.x;`,
    explanation:
      "The thread's index within the block, `threadIdx.x`, is read from the special register `%tid.x`.",
  },
  {
    cuda: `  int threads = blockDim.x;`,
    ptx: `mov.u32 %threads, %ntid.x;`,
    explanation:
      "The total number of threads in the block, `blockDim.x`, is read from the special register `%ntid.x`.",
  },
  {
    cuda: `  float local_max = -CUDART_INF_F;`,
    ptx: `mov.f32 %local_max, 0FFF800000;`,
    explanation:
      "A register for the thread's local maximum is initialized to negative infinity (`-CUDART_INF_F`), represented by the hex value `0FFF800000`.",
  },
  {
    cuda: `  for (int i = tid; i < V; i += threads) {`,
    ptx: `mov.u32 %idx, %threadid;\n$find_max_loop:\n  /* ... body ... */\n  add.u32 %idx, %idx, %threads;\n  setp.lt.u32 %guard, %idx, %V;\n  @%guard bra $find_max_loop;`,
    explanation:
      "This is a grid-stride loop. Each thread starts at its own ID (`tid`) and processes elements `threads` apart. The PTX initializes an index, loops, increments the index, and branches based on the comparison with `V`.",
  },
  {
    cuda: `    local_max = fmaxf(local_max, logits_bt[i]);`,
    ptx: `mad.wide.u32 %logits_bt_i, %idx, 4, %logits_bt;\nld.global.f32 %logits_val, [%logits_bt_i];\nmax.f32 %local_max, %local_max, %logits_val;`,
    explanation:
      "Inside the loop, the address of `logits_bt[i]` is calculated, the value is loaded from global memory (`ld.global.f32`), and `max.f32` updates the thread's local maximum.",
  },
  {
    cuda: `  }`,
    ptx: `/* (end of loop structure) */`,
    explanation: "End of the for-loop block.",
  },
  {
    cuda: `  float maxval = blockReduceMax(local_max);`,
    ptx: `/* (The entire inlined blockReduceMax PTX sequence) */`,
    explanation:
      "The `blockReduceMax` function is inlined here. This corresponds to the entire sequence of warp shuffles, shared memory writes/reads, and barriers needed to find the block-wide maximum.",
  },
  {
    cuda: `  __syncthreads();`,
    ptx: `bar.sync 0;`,
    explanation:
      "A synchronization barrier. The PTX shows this `bar.sync` as part of the inlined reduction's broadcast, ensuring every thread has the correct `maxval` before proceeding.",
  },
  {
    cuda: `  float local_sum = 0.0f;`,
    ptx: `mov.f32 %local_sum, 0F00000000;`,
    explanation:
      "A register for the thread's local sum is initialized to 0.0, represented by the hex value `0F00000000`.",
  },
  {
    cuda: `  for (int i = tid; i < V; i += threads) {`,
    ptx: `$compute_exp_loop:\n ...`,
    explanation: "Another grid-stride loop to iterate over the vocabulary.",
  },
  {
    cuda: `    float e = expf(logits_bt[i] - maxval);`,
    ptx: `ld.global.f32 %logits_val, [...];\nsub.f32 %logits_val, %logits_val, %local_max;\nmul.f32 %logits_val, %logits_val, 0f3fb8aa3b;\nex2.approx.ftz.f32 %logits_val, %logits_val;`,
    explanation:
      "This computes `exp(x)`. It first subtracts the max value (`sub.f32`), then calculates `exp(x)` by converting it to `exp2(x * log2(e))`. The `mul.f32` instruction multiplies by `log2(e)`, and `ex2.approx.ftz.f32` computes the fast, approximate base-2 exponent.",
  },
  {
    cuda: `    probs_bt[i] = e;`,
    ptx: `mad.wide.u32 %probs_bt_i, %idx, 4, %probs_bt;\nst.global.f32 [%probs_bt_i], %logits_val;`,
    explanation:
      "The calculated exponential value `e` (which is now in `%logits_val`) is stored into the `probs` array in global memory.",
  },
  {
    cuda: `    local_sum += e;`,
    ptx: `add.f32 %local_sum, %local_sum, %logits_val;`,
    explanation: "The value `e` is added to the thread's local running sum.",
  },
  {
    cuda: `  }`,
    ptx: ``,
    explanation: "End of the for-loop block.",
  },
  {
    cuda: `  float sum = blockReduceSum(local_sum);`,
    ptx: `/* (The entire inlined blockReduceSum PTX sequence) */`,
    explanation:
      "The `blockReduceSum` function is inlined. This corresponds to the PTX sequence for summing values across the block using warp shuffles and shared memory.",
  },
  {
    cuda: `  __syncthreads();`,
    ptx: `bar.sync 0;`,
    explanation:
      "Another synchronization, part of the inlined sum reduction, to broadcast the final sum to all threads.",
  },
  {
    cuda: `  float inv_sum = (sum > 0.0f ? 1.0f / sum : 0.0f);`,
    ptx: `setp.gt.f32 %guard, %local_sum, 0F00000000;\nmov.f32 %inv_sum, 0F00000000;\n@%guard rcp.approx.f32 %inv_sum, %local_sum;`,
    explanation:
      "This computes the inverse of the sum, with a check for `sum > 0`. A predicate is set, `%inv_sum` is initialized to 0.0, and then conditionally overwritten with the result of the reciprocal instruction `rcp.approx.f32` if the sum was positive.",
  },
  {
    cuda: `  for (int i = tid; i < V; i += threads) {`,
    ptx: `$normalize_loop:\n ...`,
    explanation: "A grid-stride loop to apply the normalization factor.",
  },
  {
    cuda: `    probs_bt[i] *= inv_sum;`,
    ptx: `ld.global.f32 %logits_val, [%probs_bt_i];\nmul.f32 %logits_val, %logits_val, %inv_sum;\nst.global.f32 [%probs_bt_i], %logits_val;`,
    explanation:
      "This is a read-modify-write operation. The unnormalized probability is loaded, multiplied by the inverse sum, and then stored back to global memory.",
  },
  { cuda: `  }`, ptx: ``, explanation: "End of the for-loop block." },

  {
    cuda: `  for (int i = V + tid; i < Vp; i += threads) {`,
    ptx: `add.u32 %idx, %V, %threadid;\n$zero_padding_check:\n  setp.lt.u32 %guard, %idx, %Vp;\n  @%guard bra $zero_padding_loop;`,
    explanation:
      "This loop starts where the real vocabulary ends (`V`) and zeros out any padding. The initial index is calculated as `V + tid`.",
  },
  {
    cuda: `    probs_bt[i] = 0.0f;`,
    ptx: `st.global.f32 [%probs_bt_i], 0F00000000;`,
    explanation:
      "A constant 0.0f is stored into the padding section of the `probs` array in global memory.",
  },
  { cuda: `  }`, ptx: ``, explanation: "End of the for-loop block." },
  {
    cuda: `}`,
    ptx: `$exit:\n  ret;`,
    explanation:
      "The end of the kernel. The `$exit` label is the target for early exit, and `ret` returns control from the kernel.",
  },
];

export const part6 = [
  /* ────────────────────────────────────
   // Kernel Definition and Setup
   // ─────────────────────────────────── */
  {
    cuda: `__global__ void attention_fwd_kernel(...) {`,
    ptx: `.visible .entry attention_fwd_kernel(\n  .param .u64 out_param, ...\n) {`,
    explanation:
      "The kernel's entry point. The `__global__` keyword in CUDA C++ corresponds to a `.visible .entry` function in PTX. Each argument passed to the kernel is explicitly declared as a `.param` with its corresponding type (`.u64` for pointers, `.u32` for integers).",
  },
  {
    cuda: `// C++ variable declarations`,
    ptx: `.reg .pred %cond;\n.reg .b32 %B, %T, ...;\n.reg .b64 %att_bth_ptr, ...;\n.reg .f32 %q_val, ...;`,
    explanation:
      "In PTX, all registers used within a function must be declared at the beginning. This section corresponds to all the local variable declarations in C++ (e.g., `int h`, `float maxval`, etc.). Registers are typed, such as `.pred` for predicates, `.b32` for 32-bit integers, `.b64` for 64-bit addresses, and `.f32` for single-precision floats.",
  },
  {
    cuda: `// Loading kernel parameters into registers`,
    ptx: `ld.param.u64 %out_ptr, [out_param];\nld.param.u64 %preattn_ptr, [preattn_param];\nld.param.u64 %attn_ptr, [attn_param];\nld.param.u64 %inp_ptr, [inp_param];\nld.param.u32 %B, [B_param];\nld.param.u32 %T, [T_param];\nld.param.u32 %C, [C_param];\nld.param.u32 %NH, [NH_param];`,
    explanation:
      "The first step inside the kernel is to move the parameters from the special parameter memory space into general-purpose registers. The `ld.param` (load parameter) instruction performs this for each argument.",
  },
  {
    cuda: `// Converting pointers to global address space`,
    ptx: `cvta.to.global.u64 %out_ptr, %out_ptr;\ncvta.to.global.u64 %preattn_ptr, %preattn_ptr;\ncvta.to.global.u64 %attn_ptr, %attn_ptr;\ncvta.to.global.u64 %inp_ptr, %inp_ptr;`,
    explanation:
      "The `cvta.to.global.u64` (convert address) instruction translates the loaded pointer from a parameter-specific address to a generic global memory address that can be used by load and store instructions like `ld.global`.",
  },
  {
    cuda: `  int h = blockIdx.x;`,
    ptx: `mov.u32 %h, %ctaid.x;`,
    explanation:
      "The head index `h` is assigned by reading the block's X-dimension ID from the special register `%ctaid.x` and moving it into the `%h` register.",
  },
  {
    cuda: `  int b = blockIdx.y;`,
    ptx: `mov.u32 %b, %ctaid.y;`,
    explanation:
      "The batch index `b` is assigned by reading the block's Y-dimension ID from the special register `%ctaid.y` into the `%b` register.",
  },
  {
    cuda: `  int t = threadIdx.x;`,
    ptx: `mov.u32 %t, %tid.x;`,
    explanation:
      "The token index `t` (representing the current query token) is assigned by reading the thread's X-dimension ID from the special register `%tid.x` into the `%t` register.",
  },
  {
    cuda: `  if (b >= B || h >= NH || t >= T)\n    return;`,
    ptx: `setp.ge.u32 %cond, %t, %T;\n@%cond bra $exit;\nsetp.ge.u32 %cond, %h, %NH;\n@%cond bra $exit;\nsetp.ge.u32 %cond, %b, %B;\n@%cond bra $exit;`,
    explanation:
      "These are guard clauses to prevent out-of-bounds execution. Each check uses `setp.ge.u32` (set predicate if greater or equal) to compare an index with its bound. If the condition is true, the `@%cond bra $exit` instruction performs a branch, immediately exiting the kernel for that thread.",
  },
  {
    cuda: `  int C3 = C * 3;`,
    ptx: `mul.lo.u32 %C3, %C, 3;`,
    explanation:
      "Calculates `C*3`, representing the combined size of a Query, Key, and Value vector, storing it in the `%C3` register.",
  },
  {
    cuda: `  int hs = C / NH; // head size`,
    ptx: `div.u32 %hs, %C, %NH;`,
    explanation:
      "Calculates the dimension of each attention head (`hs`) by dividing the total channels `%C` by the number of heads `%NH`.",
  },
  {
    cuda: `  float scale = 1.0f / sqrtf((float)hs);`,
    ptx: `cvt.rn.f32.u32 %hs_f32, %hs;\nsqrt.rn.f32 %hs_sqrt, %hs_f32;\nrcp.rn.f32 %scale, %hs_sqrt;`,
    explanation:
      "Computes the attention scaling factor `1/sqrt(hs)`. This is implemented in three steps: 1) `cvt` converts the integer `%hs` to a float. 2) `sqrt.rn.f32` computes the square root. 3) `rcp.rn.f32` computes the reciprocal, which is a fast way to perform division.",
  },
  {
    cuda: `  const float *inp_b = inp + b * T * C3;`,
    ptx: `mul.lo.u32 %C3_x4, %C3, 4;\nmul.lo.u32 %bT, %b, %T;\nmad.wide.u32 %inp_b_ptr, %bT, %C3_x4, %inp_ptr;`,
    explanation:
      "Calculates the base pointer for the current batch. It multiplies `C3` by 4 to get a byte stride, computes the element offset `b*T`, and then uses `mad.wide.u32` to calculate the final address: `(b*T)*(C3*4) + inp_ptr`.",
  },
  {
    cuda: `  const float *query_t = inp_b + t * C3 + h * hs;`,
    ptx: `mul.lo.u32 %hs_x4, %hs, 4;\nmad.wide.u32 %query_t_ptr, %t, %C3_x4, %inp_b_ptr;\nmad.wide.u32 %query_t_ptr, %h, %hs_x4, %query_t_ptr;`,
    explanation:
      "Calculates the pointer to this thread's query vector. First, it adds the token offset (`t * C3 * 4`) to the batch pointer. Then, it adds the head offset (`h * hs * 4`) to that intermediate result.",
  },
  {
    cuda: `  float *preatt_bth = preatt + (b * NH * T * T) + (h * T * T) + (t * T);`,
    ptx: `mad.lo.u32 %b_NH_h, %b, %NH, %h;\nmul.lo.u32 %TT, %T, %T;\nmul.lo.u32 %b_NH_TT, %b_NH_h, %TT;\nmad.lo.u32 %bth_offset, %t, %T, %b_NH_TT;\nmad.wide.u32 %preatt_bth_ptr, %bth_offset, 4, %preattn_ptr;`,
    explanation:
      "Calculates the pointer to the start of the current thread's row in the `preatt` score matrix. The complex element offset is built up in stages for clarity and then converted to a byte offset (`* 4`) and added to the base pointer.",
  },
  {
    cuda: `  float *att_bth = att + (b * NH * T * T) + (h * T * T) + (t * T);`,
    ptx: `mad.wide.u32 %att_bth_ptr, %bth_offset, 4, %attn_ptr;`,
    explanation:
      "Calculates the pointer for the final `att` matrix row, reusing the `%bth_offset` calculated previously and adding it to the base `attn_ptr`.",
  },

  /* ────────────────────────────────────
   // Pass 1: Calculate Q.K^T and find maxval
   // ─────────────────────────────────── */
  {
    cuda: `  float maxval = -10000.0f;`,
    ptx: `mov.f32 %maxval, 0fc61c4000;`,
    explanation:
      "Initializes a register to hold the maximum attention score found so far, using the hexadecimal representation of -10000.0f.",
  },
  {
    cuda: `  for (int t2 = 0; ...`,
    ptx: `mov.u32 %t2, 0;`,
    explanation:
      "This is the initialization part of the `for` loop, setting the loop counter `%t2` to 0.",
  },
  {
    cuda: `  // Start of Pass 1 loop body`,
    ptx: `$pass1_loop:`,
    explanation: "This PTX label marks the beginning of the loop for Pass 1.",
  },
  {
    cuda: `    const float *key_t2 = inp_b + t2 * C3 + h * hs + C;`,
    ptx: `mad.lo.u32 %hhsC, %h, %hs, %C;\nmad.lo.u32 %offset, %t2, %C3, %hhsC;\nmad.wide.u32 %key_t2_ptr, %offset, 4, %inp_b_ptr;`,
    explanation:
      "Calculates the pointer to the key vector for token `t2`. The `+ C` offset (to select the Key part of the QKV projection) is handled in the first `mad` instruction.",
  },
  {
    cuda: `    float val = 0.0f;`,
    ptx: `mov.f32 %val, 0f00000000;`,
    explanation:
      "Initializes an accumulator register for the dot product to zero.",
  },
  {
    cuda: `    for (int i = 0; i < hs; i++) {`,
    ptx: `mov.u32 %i, 0;\n$dot_product_loop: ... @%cond bra $dot_product_loop;`,
    explanation:
      "This inner dot product loop is implemented with explicit PTX instructions for initialization (`mov`), the loop label (`$dot_product_loop`), and a conditional branch at the end. It is not unrolled because its bound, `hs`, is a variable.",
  },
  {
    cuda: `      val += query_t[i] * key_t2[i];`,
    ptx: `mad.wide.u32 %query_ti_ptr, %i, 4, %query_t_ptr;\nmad.wide.u32 %key_t2i_ptr, %i, 4, %key_t2_ptr;\nld.global.f32 %q_val, [%query_ti_ptr];\nld.global.f32 %k_val, [%key_t2i_ptr];\nfma.rn.f32 %val, %q_val, %k_val, %val;`,
    explanation:
      "The core of the dot product. It calculates addresses for the `i`-th element of the query and key vectors, loads them from global memory, and uses `fma.rn.f32` (fused multiply-add) to multiply them and add to the running sum in `%val`.",
  },
  {
    cuda: `    // End of dot product loop`,
    ptx: `add.u32 %i, %i, 1;\nsetp.lt.u32 %cond, %i, %hs;\n@%cond bra $dot_product_loop;`,
    explanation:
      "These instructions handle the dot product loop's control flow: incrementing `i`, checking if `i < hs`, and branching back if true.",
  },
  {
    cuda: `    val *= scale;`,
    ptx: `mul.f32 %val, %val, %scale;`,
    explanation:
      "Applies the scaling factor to the completed dot product score.",
  },
  {
    cuda: `    if (val > maxval) { maxval = val; }`,
    ptx: `setp.gt.f32 %cond, %val, %maxval;\n@%cond mov.f32 %maxval, %val;`,
    explanation:
      "Updates the maximum value. `setp.gt.f32` sets a predicate if `val > maxval`, and the predicated `mov.f32` executes the update only if true.",
  },
  {
    cuda: `    preatt_bth[t2] = val;`,
    ptx: `mad.wide.u32 %preatt_bthi_ptr, %t2, 4, %preatt_bth_ptr;\nst.global.f32 [%preatt_bthi_ptr], %val;`,
    explanation:
      "Stores the raw, scaled attention score into the `preatt` matrix at column `t2`.",
  },
  {
    cuda: `  // End of Pass 1 loop`,
    ptx: `add.u32 %t2, %t2, 1;\nsetp.le.u32 %cond, %t2, %t;\n@%cond bra $pass1_loop;`,
    explanation:
      "The control flow for the outer loop of Pass 1: increments `t2`, checks if `t2 <= t`, and branches back to `$pass1_loop` if true.",
  },

  /* ────────────────────────────────────
   // Pass 2: Calculate exponentials and sum
   // ─────────────────────────────────── */
  {
    cuda: `  float expsum = 0.0f;`,
    ptx: `mov.f32 %expsum, 0f00000000;`,
    explanation:
      "Initializes the accumulator for the softmax denominator (`expsum`) to zero.",
  },
  {
    cuda: `  // Start of Pass 2 loop`,
    ptx: `mov.u32 %t2, 0;\n$pass2_loop:`,
    explanation:
      "Resets the `%t2` counter to 0 and defines the starting label for the Pass 2 loop.",
  },
  {
    cuda: `    float expv = expf(preatt_bth[t2] - maxval);`,
    ptx: `mad.wide.u32 %preatt_bthi_ptr, %t2, 4, %preatt_bth_ptr;\nld.global.f32 %preatt_val, [%preatt_bthi_ptr];\nsub.f32 %preatt_val, %preatt_val, %maxval;\nmul.f32 %preatt_val, %preatt_val, 0f3fb8aa3b;\nex2.approx.ftz.f32 %expv, %preatt_val;`,
    explanation:
      "Calculates `exp(score - maxval)`. It loads the score from `preatt`, subtracts `maxval` for stability, multiplies by `log2(e)` (`0f3fb8aa3b`), and finally computes the base-2 exponent with `ex2.approx.ftz.f32`.",
  },
  {
    cuda: `    expsum += expv;`,
    ptx: `add.f32 %expsum, %expsum, %expv;`,
    explanation:
      "Adds the newly calculated exponential value to the running sum in `%expsum`.",
  },
  {
    cuda: `    att_bth[t2] = expv;`,
    ptx: `mad.wide.u32 %att_bthi_ptr, %t2, 4, %att_bth_ptr;\nst.global.f32 [%att_bthi_ptr], %expv;`,
    explanation:
      "Stores the temporary, un-normalized numerator value into the final `att` matrix.",
  },
  {
    cuda: `  // End of Pass 2 loop`,
    ptx: `add.u32 %t2, %t2, 1;\nsetp.le.u32 %cond, %t2, %t;\n@%cond bra $pass2_loop;`,
    explanation:
      "The control flow for the Pass 2 loop, which increments and checks the `t2` counter.",
  },
  {
    cuda: `  float expsum_inv = expsum == 0.0f ? 0.0f : 1.0f / expsum;`,
    ptx: `mov.f32 %expsum_inv, 0f00000000;\nsetp.eq.f32 %cond, %expsum, 0f00000000;\n@!%cond rcp.rn.f32 %expsum_inv, %expsum;`,
    explanation:
      "Safely calculates `1.0/expsum`. It initializes the result to 0.0. A predicate checks if `expsum` is zero. If it is *not* zero (`@!%cond`), the `rcp.rn.f32` instruction computes the reciprocal.",
  },

  /* ────────────────────────────────────
   // Pass 3: Normalize scores and zero future tokens
   // ─────────────────────────────────── */
  {
    cuda: `  for (int t2 = 0; t2 <= t; t2++) {`,
    ptx: `mov.u32 %t2, 0;\n$pass3_loop:`,
    explanation:
      "Initializes the Pass 3 loop, which will normalize the attention scores.",
  },
  {
    cuda: `    att_bth[t2] *= expsum_inv;`,
    ptx: `mad.wide.u32 %att_bthi_ptr, %t2, 4, %att_bth_ptr;\nld.global.f32 %att_val, [%att_bthi_ptr];\nmul.f32 %att_val, %att_val, %expsum_inv;\nst.global.f32 [%att_bthi_ptr], %att_val;`,
    explanation:
      "This is a read-modify-write operation. It loads the numerator from `att`, multiplies it by `expsum_inv`, and stores the final normalized score back.",
  },
  {
    cuda: `  // End of Pass 3 normalization loop`,
    ptx: `add.u32 %t2, %t2, 1;\nsetp.le.u32 %cond, %t2, %t;\n@%cond bra $pass3_loop;`,
    explanation: "Control flow for the normalization loop.",
  },
  {
    cuda: `  for (int t2 = t + 1; t2 < T; t2++) {`,
    ptx: `add.u32 %t2, %t, 1;\nbra $zero_out_check;\n$zero_out_loop:`,
    explanation:
      "Initializes the loop to zero out future tokens for causality. It starts `t2` at `t+1`.",
  },
  {
    cuda: `    att_bth[t2] = 0.0f;`,
    ptx: `mad.wide.u32 %att_bthi_ptr, %t2, 4, %att_bth_ptr;\nst.global.f32 [%att_bthi_ptr], 0f00000000;`,
    explanation:
      "Stores the value 0.0f into the `att` matrix for a future token position.",
  },
  {
    cuda: `  // End of zeroing loop`,
    ptx: `add.u32 %t2, %t2, 1;\n$zero_out_check:\nsetp.lt.u32 %cond, %t2, %T;\n@%cond bra $zero_out_loop;`,
    explanation:
      "Control flow for the zeroing loop, which continues as long as `t2 < T`.",
  },

  /* ────────────────────────────────────
   // Pass 4: Accumulate weighted values
   // ─────────────────────────────────── */
  {
    cuda: `  float *out_bth = out + (b * T * C) + (t * C) + (h * hs);`,
    ptx: `mul.lo.u32 %tC, %t, %C;\nmad.lo.u32 %bth_offset, %bT, %C, %tC;\nmad.lo.u32 %bth_offset, %h, %hs, %bth_offset;\nmad.wide.u32 %out_bth_ptr, %bth_offset, 4, %out_ptr;`,
    explanation:
      "Calculates the final output pointer for this thread's vector slot.",
  },
  {
    cuda: `  for (int i = 0; i < hs; i++) { out_bth[i] = 0.0f; }`,
    ptx: `mov.u32 %i, 0;\n$init_zero_loop: ... st.global.f32 [%out_bthi_ptr], 0f00000000; ...`,
    explanation:
      "This loop initializes the output vector in global memory to all zeros before starting accumulation.",
  },
  {
    cuda: `  for (int t2 = 0; t2 <= t; t2++) {`,
    ptx: `mov.u32 %t2, 0;\n$accumulate_loop:`,
    explanation:
      "Initializes the final accumulation loop, which aggregates the weighted `value` vectors.",
  },
  {
    cuda: `    const float *value_t2 = inp_b + t2 * C3 + h * hs + C * 2;`,
    ptx: `shl.b32 %C2, %C, 1;\nmad.lo.u32 %offset, %h, %hs, %C2;\nmad.lo.u32 %value_t2_offset, %t2, %C3, %offset;\nmad.wide.u32 %value_t2_ptr, %value_t2_offset, 4, %inp_b_ptr;`,
    explanation:
      "Calculates the pointer to the `value` vector for token `t2`. The `+ C*2` offset is implemented with `shl.b32` (shift left by 1), which is a fast way to multiply by 2.",
  },
  {
    cuda: `    float att_score = att_bth[t2];`,
    ptx: `mad.wide.u32 %att_bthi_ptr, %t2, 4, %att_bth_ptr;\nld.global.f32 %att_val_f32, [%att_bthi_ptr];`,
    explanation:
      "Loads the final, normalized attention score for the current `t2` token.",
  },
  {
    cuda: `    for (int i = 0; i < hs; i++) {`,
    ptx: `mov.u32 %i, 0;\n$accumulate_inner_loop:`,
    explanation:
      "Initializes the inner loop for aggregating the `value` vector components.",
  },
  {
    cuda: `      out_bth[i] += att_score * value_t2[i];`,
    ptx: `ld.global.f32 %value_f32, [%value_t2i_ptr];\nld.global.f32 %out_val_f32, [%out_bthi_ptr];\nfma.rn.f32 %out_val_f32, %att_val_f32, %value_f32, %out_val_f32;\nst.global.f32 [%out_bthi_ptr], %out_val_f32;`,
    explanation:
      "The final accumulation step. It loads the `value` component, loads the current `out` component, performs the weighted sum `att_score * value + out` using `fma`, and stores the new result back.",
  },
  {
    cuda: `    // End of inner accumulation loop`,
    ptx: `add.u32 %i, %i, 1;\nsetp.lt.u32 %cond, %i, %hs;\n@%cond bra $accumulate_inner_loop;`,
    explanation: "Control flow for the inner accumulation loop.",
  },
  {
    cuda: `  // End of outer accumulation loop`,
    ptx: `add.u32 %t2, %t2, 1;\nsetp.le.u32 %cond, %t2, %t;\n@%cond bra $accumulate_loop;`,
    explanation: "Control flow for the outer accumulation loop.",
  },
  {
    cuda: `}`,
    ptx: `$exit:\nret;`,
    explanation:
      "The common exit point for the kernel. The `ret` instruction ends execution for the thread.",
  },
];

export const part7 = [
  /* ────────────────────────────────────
   // Vectorized Load/Store Helpers
   // ─────────────────────────────────── */
  {
    cuda: `__device__ float4 ld_vec(const float *address) {`,
    ptx: `/* This function is inlined; its logic appears directly in the caller. */`,
    explanation:
      "This helper function is designed to be inlined. It provides a C++ abstraction for performing a vectorized `float4` load.",
  },
  {
    cuda: `  return *reinterpret_cast<const float4 *>(address);`,
    ptx: `ld.global.v4.f32 {r1,r2,r3,r4}, [addr];\n/* or ld.shared.v4.f32 */`,
    explanation:
      "The core of `ld_vec`. The `reinterpret_cast` tells the programmer (and a compiler) to treat the `float*` as a `float4*`. In the handwritten PTX, this is implemented using a single vectorized load instruction to read 16 bytes into four registers.",
  },
  { cuda: `}`, ptx: ``, explanation: "End of the `ld_vec` function." },
  {
    cuda: `__device__ void st_vec(float *address, float4 val) {`,
    ptx: `/* This function is inlined; its logic appears directly in the caller. */`,
    explanation:
      "A helper function for performing a vectorized `float4` store. It is also inlined in the PTX.",
  },
  {
    cuda: `  *reinterpret_cast<float4 *>(address) = val;`,
    ptx: `st.global.v4.f32 [addr], {r1,r2,r3,r4};\n/* or st.shared.v4.f32 */`,
    explanation:
      "This C++ line is implemented in PTX using a single vectorized store instruction, which writes the contents of four registers (16 bytes) to the specified memory address.",
  },
  { cuda: `}`, ptx: ``, explanation: "End of the `st_vec` function." },

  /* ────────────────────────────────────
   // Kernel Definition and Setup
   // ─────────────────────────────────── */
  {
    cuda: `__global__ void __launch_bounds__(16 * 16)`,
    ptx: `.maxntid 256, 1, 1`,
    explanation:
      "`__launch_bounds__` specifies the thread block size, `16*16=256`. This directly corresponds to the `.maxntid` directive, which sets the maximum number of threads per block.",
  },
  {
    cuda: `    matmul_fwd_kernel(float *out, const float *inp, const float *weight, const float *bias, int C, int OC) {`,
    ptx: `.visible .entry matmul_fwd_kernel(\n  .param .u64 out_param, \n  .param .u64 inp_param, \n  .param .u64 weight_param, \n  .param .u64 bias_param, \n  .param .u32 C_param, \n  .param .u32 OC_param\n)`,
    explanation:
      "The kernel's entry point definition. Each C++ argument is explicitly defined as a parameter with a specific type in PTX. Pointers are 64-bit unsigned integers (`.u64`), and standard integers are 32-bit (`.u32`).",
  },
  {
    cuda: `  int oc = 8 * (blockIdx.y * blockDim.y + threadIdx.y);`,
    ptx: `mov.u32 %bidx_y, %ctaid.y;\nmov.u32 %bdim_y, %ntid.y;\nmov.u32 %tid_y, %tid.y;\nmad.lo.u32 %oc, %bidx_y, %bdim_y, %tid_y;\nmul.lo.u32 %oc, %oc, 8;`,
    explanation:
      "This calculates a unique row offset for the thread's 8x8 tile. The PTX first loads block index, block dimension, and thread index from special registers. It then uses `mad.lo.u32` to compute the global thread ID in the Y dimension, and `mul.lo.u32` to scale it by 8.",
  },
  {
    cuda: `  __shared__ float lhs_s[128][32];`,
    ptx: `.shared .align 4 .b8 lhs_shared[16384];`,
    explanation:
      "Allocates a tile in shared memory for the `inp` matrix. The total size is `128 * 32 * sizeof(float) = 16384` bytes. In PTX, this is declared as a raw byte array (`.b8`) with 4-byte alignment.",
  },
  {
    cuda: `  __shared__ float rhs_s[128][32];`,
    ptx: `.shared .align 4 .b8 rhs_shared[16384];`,
    explanation:
      "Allocates a second shared memory tile for the `weight` matrix.",
  },
  {
    cuda: `  inp += 128 * blockIdx.x * C;`,
    ptx: `mul.lo.u32 %bidx_x_128, %bidx_x, 128;\nmad.lo.u32 %inp_offset, %bidx_x_128, %C, 0;\nmad.wide.u32 %inp_ptr, %inp_offset, 4, %inp_ptr;`,
    explanation:
      "Offsets the `inp` pointer to the correct starting position for the current thread block. The element offset is calculated, then multiplied by 4 (bytes per float) and added to the base pointer using `mad.wide.u32`.",
  },
  {
    cuda: `  weight += 128 * blockIdx.y * C;`,
    ptx: `mul.lo.u32 %bidx_y_128, %bidx_y, 128;\nmad.lo.u32 %weight_offset, %bidx_y_128, %C, 0;\nmad.wide.u32 %weight_ptr, %weight_offset, 4, %weight_ptr;`,
    explanation:
      "Similarly offsets the `weight` pointer based on the block's Y index.",
  },
  {
    cuda: `  out += 128 * blockIdx.x * OC + 128 * blockIdx.y;`,
    ptx: `mad.lo.u32 %out_offset_x, %bidx_x_128, %OC, 0;\nadd.u32 %out_offset, %out_offset_x, %bidx_y_128;\nmad.wide.u32 %out_ptr, %out_offset, 4, %out_ptr;`,
    explanation:
      "Offsets the `out` pointer to the top-left corner of the 128x128 output tile this block will compute.",
  },
  {
    cuda: `  float vals[8][8] = {};`,
    ptx: `.reg .f32 %vals<65>;\nmov.f32 %vals1, 0f00000000;\n/* ... repeated for %vals2 through %vals8 ... */`,
    explanation:
      "This declares the 8x8 (64-element) register that will hold the thread's output tile. The PTX declares 65 registers and initializes the first few to 0.0. The rest are initialized during the bias load.",
  },
  {
    cuda: `  if (bias != NULL) {`,
    ptx: `setp.ne.u64 %cond, %bias_ptr, 0;\n@!%cond bra $after_load_bias;`,
    explanation:
      "Checks if a bias pointer was provided. The `setp.ne.u64` instruction sets a predicate flag if the pointer is not null. The `bra` (branch) instruction then skips the bias loading section if the condition is false (i.e., the pointer is null).",
  },
  {
    cuda: `    for (int i = 0; i < 8; i++) {\n      for (int j = 0; j < 8; j += 4) {\n        float4 b = ld_vec(bias + oc + j);`,
    ptx: `mad.wide.u32 %b_ptr, %oc, 4, %bias_ptr;\nld.global.v4.f32 {%vals1, %vals2, %vals3, %vals4}, [%b_ptr];\nadd.u64 %b_ptr, %b_ptr, 16;\nld.global.v4.f32 {%vals5, %vals6, %vals7, %vals8}, [%b_ptr];`,
    explanation:
      "This is a highly optimized implementation of the C++ loops. The C++ code implies loading the same 8 bias values for each of the 8 rows. The PTX performs just two `float4` loads to fetch the 8 required bias values into the first 8 `%vals` registers (`vals[0][0]` through `vals[0][7]`).",
  },
  {
    cuda: `        vals[i][j + 0] = b.x; ...`,
    ptx: `mov.f32 %vals9, %vals1;\nmov.f32 %vals10, %vals2;\n/* ... this block of mov instructions continues for all 64 registers ... */`,
    explanation:
      "This corresponds to the `i` loop in the C++. The PTX unrolls this loop and broadcasts the 8 loaded bias values across the entire 8x8 register file. For example, `%vals9` (for `vals[1][0]`) gets the value from `%vals1` (from `vals[0][0]`), and so on.",
  },

  /* ────────────────────────────────────
   // Main Calculation Loop
   // ─────────────────────────────────── */
  {
    cuda: `  for (int so = 0; so < C; so += 32) {`,
    ptx: `mov.u32 %so, 0;\n$loop_body: ... $loop_check:\nsetp.lt.u32 %cond, %so, %C;\n@%cond bra $loop_body;`,
    explanation:
      "This is the main outer loop that iterates through the `C` dimension in chunks of 32. The PTX code manually implements this with a counter (`%so`), labels (`$loop_body`, `$loop_check`), a comparison (`setp.lt.u32`), and a conditional branch (`bra`).",
  },
  {
    cuda: `    __syncthreads();`,
    ptx: `bar.sync 0;`,
    explanation:
      "First barrier of the loop. It ensures that all threads have finished their calculations from the *previous* iteration before they start loading new data into shared memory.",
  },
  {
    cuda: `    for (int y = 2 * threadIdx.y + xby8; y < 128; y += 32) {`,
    ptx: `$store_loop_body: ... $store_loop_check:\n  setp.lt.u32 %cond, %y, 128;\n  @%cond bra $store_loop_body;`,
    explanation:
      "This loop has threads cooperatively load data from global to shared memory. Each thread loads several `float4` vectors. The PTX implements this with a standard loop structure.",
  },
  {
    cuda: `      st_vec(&lhs_s[y][xo], ld_vec(inp + y * C + so + xo));`,
    ptx: `mad.wide.u32 %inp_ptr_i, ...\nld.global.v4.f32 {%lhs_s1, ...}, [%inp_ptr_i];\nmad.wide.u32 %lhs_s_ptr, ...\nst.shared.v4.f32 [%lhs_s_ptr], {%lhs_s1, ...};`,
    explanation:
      "The core of the data loading step. The PTX first calculates the source address in global memory (`inp_ptr_i`), loads a `float4` vector, calculates the destination address in shared memory (`lhs_s_ptr`), and stores the vector there.",
  },
  {
    cuda: `    __syncthreads();`,
    ptx: `bar.sync 0;`,
    explanation:
      "Second barrier of the loop. This is critical. It ensures that all data for the current tile is fully loaded into `lhs_s` and `rhs_s` before any thread starts performing calculations with it.",
  },
  {
    cuda: `    for (int si = si_start; si < si_start + 32; si += 4) {`,
    ptx: `mov.u32 %si, %si_start;\n$si_loop_body: ... \nadd.u32 %si, %si, 4;\n$si_loop_check: ...`,
    explanation:
      "This loop iterates through the 32-element wide tile currently in shared memory. Since each step processes a `float4`, the loop increments by 4.",
  },
  {
    cuda: `      float4 rhs[8];\n      for (int u = 0; u < 8; ++u) {\n        rhs[u] = ld_vec(&rhs_s[u + 8 * threadIdx.y][si % 32]);\n      }`,
    ptx: `ld.shared.v4.f32 {%rhs_s0_1, ...}, [%rhs_s_ptr];\nadd.u64 %rhs_s_ptr, ...\nld.shared.v4.f32 {%rhs_s1_1, ...}, [%rhs_s_ptr];\n/* ... repeated for all 8 rhs vectors ... */`,
    explanation:
      "This loop loads the 8 necessary `rhs` vectors for this thread from shared memory into local registers. The PTX fully unrolls this, issuing 8 separate `ld.shared.v4.f32` instructions.",
  },
  {
    cuda: `      for (int ii = 0; ii < 8; ++ii) {`,
    ptx: `/* The 'ii' loop is fully unrolled in the PTX code below. */`,
    explanation:
      "This loop iterates over the 8 rows of the thread's output tile. It is completely unrolled in the PTX to maximize instruction-level parallelism.",
  },
  {
    cuda: `        float4 lhs = ld_vec(&lhs_s[ii + 8 * threadIdx.x][si % 32]);`,
    ptx: `ld.shared.v4.f32 {%lhs_1, %lhs_2, %lhs_3, %lhs_4}, [%lhs_s_ptr];`,
    explanation:
      "Inside the unrolled `ii` loop, this line loads one `lhs` vector from shared memory. This vector will be used for calculations for an entire row of the `vals` tile.",
  },
  {
    cuda: `        for (int ji = 0; ji < 8; ++ji) {\n          vals[ii][ji] += lhs.x * rhs[ji].x; ... \n        }`,
    ptx: `fma.rn.f32 %vals1, %lhs_1, %rhs_s0_1, %vals1;\nfma.rn.f32 %vals1, %lhs_2, %rhs_s0_2, %vals1;\nfma.rn.f32 %vals1, %lhs_3, %rhs_s0_3, %vals1;\nfma.rn.f32 %vals1, %lhs_4, %rhs_s0_4, %vals1;\n/* ... this pattern of 4 fma's repeats for vals2 through vals8 ...*/`,
    explanation:
      "This is the heart of the computation. Both the `ji` loop and the four component-wise multiply-adds are unrolled. This block of `fma.rn.f32` (fused multiply-add) instructions performs the dot product between the loaded `lhs` vector and each of the 8 `rhs` vectors, accumulating the results into the `vals` registers for the current row (`ii`).",
  },
  {
    cuda: `      /* End of ii loop */`,
    ptx: `/* The block of (ld.shared + 32 * fma) is repeated 7 more times for ii=1..7 */`,
    explanation:
      "The entire pattern of loading an `lhs` vector and performing 32 `fma` operations is duplicated in the PTX code for each of the 8 rows of the output tile.",
  },

  /* ────────────────────────────────────
   // Write-back to Global Memory
   // ─────────────────────────────────── */
  {
    cuda: `  for (int i = 0; i < 8; ++i) {\n    for (int j = 0; j < 8; j += 4) {\n      st_vec(out + ..., result);\n    }\n  }`,
    ptx: `mad.wide.u32 %out_s_ptr, ... \n/* This entire nested loop is unrolled below */`,
    explanation:
      "The final loops write the computed 8x8 tile from registers back to global memory. The PTX completely unrolls these loops for maximum throughput.",
  },
  {
    cuda: `  /* Iteration i = 0 */`,
    ptx: `st.global.v4.f32 [%out_s_ptr], {%vals1, %vals2, %vals3, %vals4};\nadd.u64 %b_ptr, %out_s_ptr, 16;\nst.global.v4.f32 [%b_ptr], {%vals5, %vals6, %vals7, %vals8};`,
    explanation:
      "This corresponds to the first row (`i=0`). The first 8 registers (`%vals1` to `%vals8`) are stored using two `st.global.v4.f32` instructions.",
  },
  {
    cuda: `  /* Iteration i = 1 */`,
    ptx: `add.u64 %out_s_ptr, %out_s_ptr, %OC4;\nst.global.v4.f32 [%out_s_ptr], {%vals9, %vals10, %vals11, %vals12};\n...`,
    explanation:
      "For the next row (`i=1`), the output pointer is advanced by the row stride (`%OC4`), and the next 8 registers (`%vals9` to `%vals16`) are stored. This pattern continues for all 8 rows.",
  },
  {
    cuda: `}`,
    ptx: `ret;`,
    explanation:
      "The final instruction in the kernel, which ends its execution and returns control.",
  },
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
      className="ptx-code"
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
      className="ptx-code"
      dangerouslySetInnerHTML={highlight(code)}
    />
  );
};

// Component to parse explanations and highlight inline code
const Explanation = ({ text }) => {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <p className="ptx-explanation-text">
      {parts.map((part, i) =>
        part.startsWith("`") ? (
          <code
            key={i}
            className="ptx-inline-code"
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
  const hasCode = (code) => Boolean(code?.trim());

  return (
    <main className="ptx-walkthrough">
      <div className="ptx-walkthrough-header">
        <div>CUDA C++</div>
        <div>PTX Assembly</div>
        <div>Explanation</div>
      </div>

      <div className="ptx-walkthrough-rows">
        {part.map((item, index) => (
          <div key={index} className="ptx-walkthrough-row-shell">
            <div
              key={index}
              className={`ptx-walkthrough-row ${hoveredIndex === index ? "is-active" : ""}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="ptx-walkthrough-cell">
                {hasCode(item.cuda) && (
                  <>
                    <div className="ptx-mobile-label">CUDA C++</div>
                    <div className="ptx-code-panel ptx-code-panel-cuda">
                      <CudaHighlighter code={item.cuda} />
                    </div>
                  </>
                )}
              </div>

              <div className="ptx-walkthrough-cell">
                {hasCode(item.ptx) && (
                  <>
                    <div className="ptx-mobile-label">PTX Assembly</div>
                    <div className="ptx-code-panel ptx-code-panel-ptx">
                      <PtxHighlighter code={item.ptx} />
                    </div>
                  </>
                )}
              </div>

              <div className="ptx-walkthrough-cell">
                <div className="ptx-mobile-label">Explanation</div>
                <div className="ptx-explanation-panel">
                  <Explanation text={item.explanation} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
