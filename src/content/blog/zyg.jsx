import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Card, AnimateOnScroll, CodeWindow } from "../../components/ui.jsx";

import RepoCard from "react-repo-card";

// Reusable BarChart Component
const BarChart = ({ chartData, options }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: options,
      });
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, options]);

  return (
    <div className="chart-container relative w-full h-[350px] max-w-xl mx-auto">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

// Reusable CodeBlock Component
const CodeBlock = ({ title, language, code }) => {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current && window.hljs) {
      window.hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  const accentClass =
    language === "python" ? "text-accent-python" : "text-accent-zig";

  return (
    <div className="bg-subtle p-4 rounded-md">
      <h5 className={`font-semibold ${accentClass} mb-2`}>{title}</h5>
      <pre className="text-xs bg-slate-950 rounded-md overflow-x-auto">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

const data = [
  {
    title: "Basic Function with Error Handling",
    python:
      '@zig()\ndef hello() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    stdout: Const[Infer] = std.io.getStdOut().writer()\n    Try(stdout.print("Hello, {s}!\\n", ("world",)))',
    zig: 'pub fn hello() anyerror!void {\n    const std = @import("std");\n    const stdout = std.io.getStdOut().writer();\n    try (stdout.print("Hello, {s}!\\n", .{"world"}));\n}',
    explanation:
      '<p>This demonstrates the fundamental translation of a Python function into a public Zig function.</p><ul><li>The <code>@zig()</code> decorator signals the function for transpilation.</li><li>The Python type hint <code>Error[anyerror, void]</code> directly maps to Zig\'s error union type <code>anyerror!void</code>, indicating the function can either return an error or complete successfully (<code>void</code>).</li><li><code>Import("std")</code> becomes the Zig builtin <code>@import("std")</code>.</li><li>The <code>Try(...)</code> wrapper is a syntactic sugar that translates to Zig\'s <code>try</code> keyword, which propagates any error returned by the expression.</li><li>The tuple of format arguments <code>("world",)</code> is converted into a Zig anonymous struct literal <code>.{"world"}</code>, which is the standard way to pass arguments to variadic functions like <code>print</code>.</li></ul>',
  },
  {
    title: "Simple Function Translation",
    python:
      '@zig()\ndef hello2() -> void:\n    std: Const[Infer] = Import("std")\n    std.debug.print("Hello, world!\\n", ())',
    zig: 'pub fn hello2() void {\n    const std = @import("std");\n    std.debug.print("Hello, world!\\n", .{});\n}',
    explanation:
      "<p>A straightforward function translation without error handling.</p><ul><li>The <code>-> void</code> type hint correctly maps to the <code>void</code> return type in Zig.</li><li>A call to <code>std.debug.print</code> is translated directly.</li><li>The empty tuple <code>()</code> used for format arguments becomes an empty anonymous struct literal <code>.{}</code> in Zig.</li></ul>",
  },
  {
    title: "Values and Data Types",
    python:
      '@zig(print_generated=True)\ndef values() -> void:\n    std: Const[Infer] = Import("std")\n    print: Const[Infer] = std.debug.print\n    assert_: Const[Infer] = std.debug.assert_\n\n    one_plus_one: Const[i32] = 1 + 1\n    print("1 + 1 = {}\\n", (one_plus_one,))\n\n    seven_div_three: Const[f32] = 7.0 / 3.0\n    print("7.0 / 3.0 = {}\\n", (seven_div_three,))\n\n    print("{}\\n{}\\n{}\\n", (True and False, True or False, not True))\n\n    optional_value: Var[Optional[Slice[Const[u8]]]] = None\n    assert_(optional_value == None)\n\n    print("\\noptional 1\\ntype: {}\\nvalue: {?s}\\n",\n          (TypeOf(optional_value), optional_value,))\n\n    optional_value = "hi"\n    assert_(optional_value != None)\n\n    print("\\noptional 2\\ntype: {}\\nvalue: {?s}\\n",\n          (TypeOf(optional_value), optional_value,))\n\n    number_or_error: Var[Error[anyerror, i32]] = error.ArgNotFound\n\n    print("\\nerror union 1\\ntype: {}\\nvalue: {!}\\n",\n          (TypeOf(number_or_error), number_or_error))\n\n    number_or_error = 1234\n\n    print("\\nerror union 2\\ntype: {}\\nvalue: {!}\\n",\n          (TypeOf(number_or_error), number_or_error,))',
    zig: 'pub fn values() void {\n    const std = @import("std");\n    const print = std.debug.print;\n    const assert = std.debug.assert;\n    const one_plus_one: i32 = (1 + 1);\n    print("1 + 1 = {}\\n", .{one_plus_one});\n    const seven_div_three: f32 = (7.0 / 3.0);\n    print("7.0 / 3.0 = {}\\n", .{seven_div_three});\n    print("{}\\n{}\\n{}\\n", .{ true and false, true or false, (!true) });\n    var optional_value: ?[]const u8 = null;\n    assert(optional_value == null);\n    print("\\noptional 1\\ntype: {}\\nvalue: {?s}\\n", .{ @TypeOf(optional_value), optional_value });\n    optional_value = "hi";\n    assert(optional_value != null);\n    print("\\noptional 2\\ntype: {}\\nvalue: {?s}\\n", .{ @TypeOf(optional_value), optional_value });\n    var number_or_error: anyerror!i32 = error.ArgNotFound;\n    print("\\nerror union 1\\ntype: {}\\nvalue: {!}\\n", .{ @TypeOf(number_or_error), number_or_error });\n    number_or_error = 1234;\n    print("\\nerror union 2\\ntype: {}\\nvalue: {!}\\n", .{ @TypeOf(number_or_error), number_or_error });\n}',
    explanation:
      "<p>This block demonstrates how various Python data types and values are mapped to their Zig equivalents.</p><ul><li><b>Variables:</b> <code>Const[T]</code> and <code>Var[T]</code> map to Zig's <code>const</code> and <code>var</code>.</li><li><b>Operators:</b> Python's boolean operators <code>and</code>, <code>or</code>, <code>not</code> map to Zig's <code>and</code>, <code>or</code>, and <code>!</code>.</li><li><b>Optionals:</b> The type hint <code>Optional[T]</code> becomes <code>?T</code> in Zig, and the Python value <code>None</code> becomes <code>null</code>.</li><li><b>Error Unions:</b> <code>Error[E, T]</code> becomes <code>E!T</code>. An error value like <code>error.ArgNotFound</code> is translated directly.</li><li><b>Reflection:</b> The <code>TypeOf()</code> function maps to the <code>@TypeOf()</code> builtin to get a value's type at compile time.</li></ul>",
  },
  {
    title: "Undefined Initialization",
    python:
      '@zig()\ndef assign_undefined() -> void:\n    std: Const[Infer] = Import("std")\n    print: Const[Infer] = std.debug.print\n\n    x: Var[i32] = undefined\n    x = 1\n    print("{d}\\n", (x,))',
    zig: 'pub fn assign_undefined() void {\n    const std = @import("std");\n    const print = std.debug.print;\n    var x: i32 = undefined;\n    x = 1;\n    print("{d}\\n", .{x});\n}',
    explanation:
      "<p>The special Python keyword <code>undefined</code> provided by the library is directly translated to Zig's <code>undefined</code> keyword. This is used to declare a variable without initializing it, with the expectation that it will be assigned a value before being read.</p>",
  },
  {
    title: "Struct Declaration",
    python: "@zig_struct()\nclass Point(ZigStruct):\n    x: i32\n    y: i32",
    zig: "const Point = extern struct {\n    x: i32,\n    y: i32,\n};",
    explanation:
      "<p>A Python class decorated with <code>@zig_struct</code> and inheriting from <code>ZigStruct</code> is transpiled into a Zig <code>extern struct</code>.</p><ul><li>The generated code has<code>extern</code> keyword which ensures the struct has a well-defined memory layout according to the C ABI, which is crucial for interoperability.</li><li>The class fields with type hints (e.g., <code>x: i32</code>) become the fields of the Zig struct.</li></ul>",
  },
  {
    title: "Struct Instantiation",
    python:
      "@zig()\ndef make_point(x: i32) -> Point:\n    return {x: x, y: x * 2}",
    zig: "pub fn make_point(\n    x: i32,\n) Point {\n    return .{ .x = x, .y = (x * 2) };\n}",
    explanation:
      "<p>This function demonstrates struct instantiation. The Python dictionary literal <code>{'x': x, 'y': x * 2}</code> is used to initialize the <code>Point</code> struct and is translated into Zig's idiomatic struct literal syntax <code>.{ .x = x, .y = (x * 2) }</code>. The leading dot <code>.</code> tells the compiler to infer the type of the literal from the context (in this case, the function's return type <code>Point</code>).</p>",
  },
  {
    title: "Array Operations",
    python:
      "@zig()\ndef arrays() -> void:\n    std: Const[Infer] = Import(\"std\")\n    mem: Const[Infer] = std.mem\n    assert_: Const[Infer] = std.debug.assert_\n\n    message: Const[Infer] = list(\n        [chr('h'), chr('e'), chr('l'), chr('l'), chr('o')], u8)\n    alt_message: Const[Array[5, u8]] = (\n        chr('h'), chr('e'), chr('l'), chr('l'), chr('o'))\n    with comptime:\n        assert_(mem.eql(u8, ref(message), ref(alt_message)))\n        assert_(message.len == 5)\n\n    same_message: Const[Infer] = \"hello\"\n    with comptime:\n        assert_(mem.eql(u8, ref(message), same_message))\n\n    sum: Var[usize] = 0\n    for byte in message:\n        sum += byte\n    assert_(sum == chr('h') + chr('e') + chr('l') * 2 + chr('o'))\n\n    some_integers: Var[Array[100, i32]] = undefined\n    for *item, i in (ref(some_integers), range(0, None)):\n        item.deref = IntCast(i)\n    assert_(some_integers[10] == 10)\n    assert_(some_integers[99] == 99)\n\n    part_one: Const[Infer] = list([1, 2, 3, 4], i32)\n    part_two: Const[Infer] = list([5, 6, 7, 8], i32)\n    all_of_it: Const[Infer] = cat(part_one, part_two)\n    assert_(mem.eql(i32, ref(all_of_it), ref(\n        list([1, 2, 3, 4, 5, 6, 7, 8], i32))))\n\n    hello_: Const[Infer] = \"hello\"\n    world: Const[Infer] = \"world\"\n    hello_world: Const[Infer] = cat(hello_, \" \", world)\n    assert_(mem.eql(u8, hello_world, \"hello world\"))\n\n    pattern: Const[Infer] = repeat(\"ab\", 3)\n    assert_(mem.eql(u8, pattern, \"ababab\"))\n\n    all_zero: Const[Infer] = repeat(list([0], u16), 10)\n    assert_(all_zero.len == 10)\n    assert_(all_zero[5] == 0)\n\n    more_points: Const[Array[10, Point]] = repeat(\n        list([make_point(3)], Point), 10)\n    assert_(more_points[4].x == 3)\n    assert_(more_points[4].y == 6)\n    assert_(more_points.len == 10)",
    zig: "pub fn arrays() void {\n    const std = @import(\"std\");\n    const mem = std.mem;\n    const assert = std.debug.assert;\n    const message = [_]u8{ 'h', 'e', 'l', 'l', 'o' };\n    const alt_message: [5]u8 = .{ 'h', 'e', 'l', 'l', 'o' };\n    comptime {\n        assert(mem.eql(u8, &message, &alt_message));\n        assert(message.len == 5);\n    }\n    const same_message = \"hello\";\n    comptime {\n        assert(mem.eql(u8, &message, same_message));\n    }\n    var sum: usize = 0;\n    for (message) |byte| {\n        sum += byte;\n    }\n    assert(sum == ((('h' + 'e') + ('l' * 2)) + 'o'));\n    var some_integers: [100]i32 = undefined;\n    for (&some_integers, 0..) |*item, i| {\n        item.* = @intCast(i);\n    }\n    assert(some_integers[10] == 10);\n    assert(some_integers[99] == 99);\n    const part_one = [_]i32{ 1, 2, 3, 4 };\n    const part_two = [_]i32{ 5, 6, 7, 8 };\n    const all_of_it = part_one ++ part_two;\n    assert(mem.eql(i32, &all_of_it, &[_]i32{ 1, 2, 3, 4, 5, 6, 7, 8 }));\n    const hello_ = \"hello\";\n    const world = \"world\";\n    const hello_world = hello_ ++ \" \" ++ world;\n    assert(mem.eql(u8, hello_world, \"hello world\"));\n    const pattern = \"ab\" ** 3;\n    assert(mem.eql(u8, pattern, \"ababab\"));\n    const all_zero = [_]u16{0} ** 10;\n    assert(all_zero.len == 10);\n    assert(all_zero[5] == 0);\n    const more_points: [10]Point = [_]Point{make_point(3)} ** 10;\n    assert(more_points[4].x == 3);\n    assert(more_points[4].y == 6);\n    assert(more_points.len == 10);\n}",
    explanation:
      "<p>This block covers various ways to create and manipulate arrays in Zig via Python syntax.</p><ul><li><b>Literals:</b> <code>list([...], T)</code> translates to an inferred-size array <code>[_]T{...}</code>. <code>Array[N, T]</code> becomes a fixed-size array <code>[N]T</code>.</li><li><b>Comptime:</b> <code>with comptime:</code> becomes a <code>comptime {}</code> block, ensuring its contents are evaluated by the compiler.</li><li><b>Iteration:</b> Python's <code>for</code> loop translates to Zig's <code>for</code>. Iterating by pointer to modify elements is done with <code>for *item in ref(arr)</code>, which becomes <code>for(&arr) |*item|</code>.</li><li><b>Operators:</b> The library functions <code>cat()</code> and <code>repeat()</code> map to Zig's array concatenation <code>++</code> and repetition <code>**</code> operators.</li></ul>",
  },
  {
    title: "Multi-Dimensional Arrays",
    python:
      '@zig()\ndef multidimensional_arrays() -> void:\n    std: Const[Infer] = Import("std")\n    assert_: Const[Infer] = std.debug.assert_\n    mat4x4: Const[Array[4, Array[4, f32]]] = (\n        (1.0, 0.0, 0.0, 0.0),\n        (0.0, 1.0, 0.0, 1.0),\n        (0.0, 0.0, 1.0, 0.0),\n        (0.0, 0.0, 0.0, 1.0),\n    )\n    assert_(mat4x4[1][1] == 1.0)\n\n    all_zero: Const[Array[4, Array[4, f32]]] = (\n        (0.0, 0.0, 0.0, 0.0),\n        (0.0, 0.0, 0.0, 0.0),\n        (0.0, 0.0, 0.0, 0.0),\n        (0.0, 0.0, 0.0, 0.0),\n    )\n    assert_(all_zero[0][0] == 0.0)',
    zig: 'pub fn multidimensional_arrays() void {\n    const std = @import("std");\n    const assert = std.debug.assert;\n    const mat4x4: [4][4]f32 = .{ .{ 1.0, 0.0, 0.0, 0.0 }, .{ 0.0, 1.0, 0.0, 1.0 }, .{ 0.0, 0.0, 1.0, 0.0 }, .{ 0.0, 0.0, 0.0, 1.0 } };\n    assert(mat4x4[1][1] == 1.0);\n    const all_zero: [4][4]f32 = .{ .{ 0.0, 0.0, 0.0, 0.0 }, .{ 0.0, 0.0, 0.0, 0.0 }, .{ 0.0, 0.0, 0.0, 0.0 }, .{ 0.0, 0.0, 0.0, 0.0 } };\n    assert(all_zero[0][0] == 0.0);\n}',
    explanation:
      "<p>A Python tuple of tuples, combined with the nested type hint <code>Array[4, Array[4, f32]]</code>, is translated into a Zig multi-dimensional array of type <code>[4][4]f32</code>. The initialization uses Zig's nested anonymous struct literal syntax for clarity.</p>",
  },
  {
    title: "Sentinel-Terminated Arrays",
    python:
      '@zig()\ndef zero_terminated_sentinel_array() -> void:\n    std: Const[Infer] = Import("std")\n    assert_: Const[Infer] = std.debug.assert_\n\n    array: Const[Array[4, 0, u8]] = (1, 2, 3, 4)\n    assert_(TypeOf(array) == type(Array[4, 0, u8]))\n    assert_(array.len == 4)\n    assert_(array[4] == 0)',
    zig: 'pub fn zero_terminated_sentinel_array() void {\n    const std = @import("std");\n    const assert = std.debug.assert;\n    const array: [4:0]u8 = .{ 1, 2, 3, 4 };\n    assert(@TypeOf(array) == [4:0]u8);\n    assert(array.len == 4);\n    assert(array[4] == 0);\n}',
    explanation:
      "<p>The special type hint <code>Array[N, S, T]</code> is used to create a sentinel-terminated array, a common pattern for C interoperability.</p><ul><li><code>Array[4, 0, u8]</code> translates to Zig's <code>[4:0]u8</code> syntax.</li><li>This creates an array with a length of 4 and a capacity of 5.</li><li>The compiler automatically places the sentinel value (<code>0</code>) at the end of the array (index 4), which can be accessed without causing a bounds check error.</li></ul>",
  },
  {
    title: "SIMD Vectors",
    python:
      '@zig()\ndef basic_vector() -> void:\n    std: Const[Infer] = Import("std")\n    assert_: Const[Infer] = std.debug.assert_\n\n    a: Const[Infer] = Vector(4, i32)(1, 2, 3, 4)\n    b: Const[Infer] = Vector(4, i32)(5, 6, 7, 8)\n    c: Const[Infer] = a + b\n\n    assert_(c[0] == 6)\n    assert_(c[1] == 8)\n    assert_(c[2] == 10)\n    assert_(c[3] == 12)',
    zig: 'pub fn basic_vector() void {\n    const std = @import("std");\n    const assert = std.debug.assert;\n    const a = @Vector(4, i32){ 1, 2, 3, 4 };\n    const b = @Vector(4, i32){ 5, 6, 7, 8 };\n    const c = (a + b);\n    assert(c[0] == 6);\n    assert(c[1] == 8);\n    assert(c[2] == 10);\n    assert(c[3] == 12);\n}',
    explanation:
      "<p>The library's <code>Vector(N, T)(...)</code> syntax for creating SIMD vectors is translated to Zig's <code>@Vector(N, T){...}</code> builtin. This allows for performing parallel operations on data. Standard arithmetic operators like <code>+</code> are overloaded for vector types, performing the operation element-wise.</p>",
  },
  {
    title: "Pointer and Dereference Syntax",
    python:
      '@zig()\ndef address_of_syntax() -> void:\n    std: Const[Infer] = Import("std")\n    assert_: Const[Infer] = std.debug.assert_\n\n    x: Const[i32] = 1234\n    x_ptr: Const[Infer] = ref(x)\n    assert_(TypeOf(x_ptr) == type(Ptr[Const[i32]]))\n    assert_(x_ptr.deref == 1234)\n\n    y: Var[i32] = 5678\n    y_ptr: Const[Infer] = ref(y)\n    assert_(TypeOf(y_ptr) == type(Ptr[i32]))\n    y_ptr.deref += 1\n    assert_(y_ptr.deref == 5679)',
    zig: 'pub fn address_of_syntax() void {\n    const std = @import("std");\n    const assert = std.debug.assert;\n    const x: i32 = 1234;\n    const x_ptr = &x;\n    assert(@TypeOf(x_ptr) == *const i32);\n    assert(x_ptr.* == 1234);\n    var y: i32 = 5678;\n    const y_ptr = &y;\n    assert(@TypeOf(y_ptr) == *i32);\n    y_ptr.* += 1;\n    assert(y_ptr.* == 5679);\n}',
    explanation:
      "<p>This block shows the translation of fundamental pointer operations.</p><ul><li><b>Address-of:</b> The library function <code>ref()</code> is the Python-side syntax for taking the address of a variable, which translates to the <code>&</code> operator in Zig.</li><li><b>Dereference:</b> The <code>.deref</code> attribute is used to access the value a pointer points to, translating to the <code>.*</code> syntax in Zig.</li><li><b>Pointer Types:</b> The type hint <code>Ptr[T]</code> becomes <code>*T</code> (a mutable pointer), and <code>Ptr[Const[T]]</code> becomes <code>*const T</code> (an immutable pointer).</li></ul>",
  },
  {
    title: "Pointer Arithmetic",
    python:
      '@zig()\ndef pointer_arithmetic_with_many_item_pointer() -> void:\n    std: Const[Infer] = Import("std")\n    assert_: Const[Infer] = std.debug.assert_\n\n    array: Const[Infer] = list([1, 2, 3, 4], i32)\n    ptr: Var[Array[Const[i32]]] = ref(array)\n    assert_(ptr[0] == 1)\n    ptr += 1\n    assert_(ptr[0] == 2)\n    assert_(ptr[1:] == ptr + 1)',
    zig: 'pub fn pointer_arithmetic_with_many_item_pointer() void {\n    const std = @import("std");\n    const assert = std.debug.assert;\n    const array = [_]i32{ 1, 2, 3, 4 };\n    var ptr: [*]const i32 = &array;\n    assert(ptr[0] == 1);\n    ptr += 1;\n    assert(ptr[0] == 2);\n    assert(ptr[1..] == (ptr + 1));\n}',
    explanation:
      "<p>A many-item pointer (<code>[*]T</code>), which is a pointer without a known length at compile time, can be manipulated with arithmetic.</p><ul><li>The type hint <code>Array[T]</code> (without a size) translates to <code>[*]T</code>.</li><li><code>ptr += 1</code> advances the pointer to the next element in memory, automatically scaling by <code>@sizeOf(T)</code>.</li><li>Slicing is also possible with many-item pointers, where <code>ptr[1:]</code> becomes <code>ptr[1..]</code>.</li></ul>",
  },
  {
    title: "Integer-Pointer Conversion",
    python:
      '@zig()\ndef integer_pointer_conversion() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    testing: Const[Infer] = std.testing\n    ptr: Const[Ptr[i32]] = PtrFromInt(0xdeadbee0)\n    addr: Const[Infer] = IntFromPtr(ptr)\n    Try(testing.expect(TypeOf(addr) == usize))\n    Try(testing.expect(addr == 0xdeadbee0))',
    zig: 'pub fn integer_pointer_conversion() anyerror!void {\n    const std = @import("std");\n    const testing = std.testing;\n    const ptr: *i32 = @ptrFromInt(3735928544);\n    const addr = @intFromPtr(ptr);\n    try (testing.expect(@TypeOf(addr) == usize));\n    try (testing.expect(addr == 3735928544));\n}',
    explanation:
      "<p>This demonstrates explicit, unsafe conversion between integers and pointers, a low-level feature necessary for certain types of systems programming.</p><ul><li>The library function <code>PtrFromInt()</code> is translated to the Zig builtin <code>@ptrFromInt()</code>.</li><li>The library function <code>IntFromPtr()</code> is translated to the Zig builtin <code>@intFromPtr()</code>.</li><li>The resulting integer type from <code>@intFromPtr</code> is always <code>usize</code>, the pointer-sized integer.</li></ul>",
  },
  {
    title: "Slice Creation and Properties",
    python:
      '@zig()\ndef basic_slices() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    assert_: Const[Infer] = std.debug.assert_\n    expectEqualSlices: Const[Infer] = std.testing.expectEqualSlices\n\n    array: Var[Infer] = list([1, 2, 3, 4], i32)\n    known_at_runtime_zero: Var[usize] = 0\n    _ = ref(known_at_runtime_zero)\n    slice: Const[Infer] = array[known_at_runtime_zero:array.len]\n\n    alt_slice: Const[Slice[Const[i32]]] = ref((1, 2, 3, 4))\n\n    Try(expectEqualSlices(i32, slice, alt_slice))\n    assert_(TypeOf(slice) == type(Slice[i32]))\n    assert_(ref(slice[0]) == ref(array[0]))\n    assert_(slice.len == array.len)\n\n    array_ptr: Const[Infer] = array[0:array.len]\n    assert_(TypeOf(array_ptr) == type(Ptr[Array[array.len, i32]]))',
    zig: 'pub fn basic_slices() anyerror!void {\n    const std = @import("std");\n    const assert = std.debug.assert;\n    const expectEqualSlices = std.testing.expectEqualSlices;\n    var array = [_]i32{ 1, 2, 3, 4 };\n    var known_at_runtime_zero: usize = 0;\n    _ = &known_at_runtime_zero;\n    const slice = array[known_at_runtime_zero..array.len];\n    const alt_slice: []const i32 = &.{ 1, 2, 3, 4 };\n    try (expectEqualSlices(i32, slice, alt_slice));\n    assert(@TypeOf(slice) == []i32);\n    assert(&slice[0] == &array[0]);\n    assert(slice.len == array.len);\n    const array_ptr = array[0..array.len];\n    assert(@TypeOf(array_ptr) == *[array.len]i32);',
    explanation:
      "<p>This block covers the distinction between slices and array pointers.</p><ul><li>Slicing an array <code>array[start:end]</code> becomes <code>array[start..end]</code>.</li><li>If the length of the slice (<code>end - start</code>) is known at compile time, the result is a pointer to an array, e.g., <code>*[4]i32</code>.</li><li>If the length is determined at runtime (e.g., using a variable), the result is a slice type, e.g., <code>[]i32</code>.</li><li>A slice is a 'fat pointer', containing both a pointer to the data and a length, while an array pointer is just a memory address.</li></ul>",
  },
  {
    title: "Generic Data Structures",
    python:
      "@zig(export=False)\ndef LinkedList(T: comptime | type) -> type:\n    class temp(ZigStruct):\n        first: Optional[Ptr[Node]]\n        last: Optional[Ptr[Node]]\n        len: usize\n\n        class Node(ZigStruct):\n            prev: Optional[Ptr[Node]]\n            next: Optional[Ptr[Node]]\n            data: T\n\n    return temp",
    zig: "pub fn LinkedList(\n    comptime T: type,\n) type {\n    const temp = struct {\n        first: ?*Node,\n        last: ?*Node,\n        len: usize,\n        const Node = struct {\n            prev: ?*Node,\n            next: ?*Node,\n            data: T,\n        };\n    };\n    return temp;\n}",
    explanation:
      "<p>This demonstrates a generic data structure pattern, a powerful feature of Zig's compile-time capabilities.</p><ul><li>A Python function that takes a <code>comptime | type</code> argument and returns a <code>type</code> is translated into a Zig function that takes a <code>comptime T: type</code> and returns a <code>type</code>.</li><li>This allows the function to act as a type factory. When called with a concrete type like <code>LinkedList(i32)</code>, the compiler instantiates a new struct definition specifically for <code>i32</code>.</li></ul>",
  },
  {
    title: "Structs with Default Fields",
    python:
      "@zig_struct()\nclass Foo(ZigStruct):\n    a: i32 = 1234\n    b: i32\n\n\n@zig()\ndef default_struct_initialization_fields() -> Error[anyerror, void]:\n\n    x: Const[Foo] = {\n        b: 5\n    }\n    if x.a + x.b != 1239:\n        with comptime:\n            unreachable()",
    zig: "const Foo = extern struct {\n    a: i32 = 1234,\n    b: i32,\n};\n\npub fn default_struct_initialization_fields() anyerror!void {\n    const x: Foo = .{ .b = 5 };\n    if ((x.a + x.b) != 1239) {\n        comptime {\n            unreachable;\n        }\n    } else {}\n}",
    explanation:
      "<p>Default field values can be specified in the Python class definition (e.g., <code>a: i32 = 1234</code>), which translates to default values in the Zig struct definition.</p><p>When initializing the struct, fields with default values can be omitted (as <code>a</code> is here). The compiler will automatically use the specified default value (<code>1234</code>) for the uninitialized field.</p>",
  },
  {
    title: "Bit-Casting Structs",
    python:
      '@zig_struct()\nclass Full(ZigPackedStruct):\n    number: u16\n\nclass u4(ZigType):\n    ...\n\n@zig_struct()\nclass Divided(ZigPackedStruct):\n    half1: u8\n    quarter3: u4\n    quarter4: u4\n\n\n@zig()\ndef struct_bitcast() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    assert_: Const[Infer] = std.debug.assert_\n    native_endian: Const[Infer] = Import("builtin").target.cpu.arch.endian()\n\n    full: Const[Full] = {number: 0x1234}\n    divided: Const[Divided] = BitCast(full)\n    assert_(divided.half1 == 0x34)\n    assert_(divided.quarter3 == 0x2)\n    assert_(divided.quarter4 == 0x1)\n\n    ordered: Const[Array[2, u8]] = BitCast(full)',
    zig: 'const Full = packed struct {\n    number: u16,\n};\nconst Divided = packed struct {\n    half1: u8,\n    quarter3: u4,\n    quarter4: u4,\n};\n\npub fn struct_bitcast() anyerror!void {\n    const std = @import("std");\n    const assert = std.debug.assert;\n    const native_endian = @import("builtin").target.cpu.arch.endian();\n    const full: Full = .{ .number = 4660 };\n    const divided: Divided = @bitCast(full);\n    assert(divided.half1 == 52);\n    assert(divided.quarter3 == 2);\n    assert(divided.quarter4 == 1);\n    const ordered: [2]u8 = @bitCast(full);',
    explanation:
      "<p>This shows how to reinterpret the memory of one type as another, which is useful for parsing binary data or hardware interaction.</p><ul><li><code>ZigPackedStruct</code> translates to <code>packed struct</code>, which has no padding between fields.</li><li>Custom integer types like <code>u4</code> can be defined to represent non-byte-aligned fields.</li><li>The <code>BitCast()</code> function translates to the <code>@bitCast()</code> builtin, which reinterprets the bits of a value as a different type of the same size. Here, a <code>u16</code> is reinterpreted as a struct of smaller integers.</li></ul>",
  },
  {
    title: "Anonymous Structs and Tuples",
    python:
      '@zig()\ndef fully_anonymous_struct() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    expect: Const[Infer] = std.testing.expect\n\n    args: Const[Infer] = {\n        int: As(u32, 1234),\n        float: As(f64, 12.34),\n        b: True,\n        s: "hi",\n    }\n\n    Try(expect(args.int == 1234))\n    Try(expect(args.float == 12.34))',
    zig: 'pub fn fully_anonymous_struct() anyerror!void {\n    const std = @import("std");\n    const expect = std.testing.expect;\n    const args = .{ .int = @as(u32, 1234), .float = @as(f64, 12.34), .b = true, .s = "hi" };\n    try (expect(args.int == 1234));\n    try (expect(args.float == 12.34));\n}',
    explanation:
      '<p>A Python dictionary literal assigned to a variable with an inferred type (<code>Const[Infer]</code>) is translated into a Zig anonymous struct literal <code>.{ .field = value, ... }</code>. This is a convenient way to create one-off data structures without a formal <code>struct</code> definition. Tuples in Zig are a special case of anonymous structs where the field names are integers (e.g., <code>"0"</code>, <code>"1"</code>).</p>',
  },
  {
    title: "Enum Declaration",
    python:
      "@zig_enum()\nclass Value2(ZigEnum, u32):\n    hundred = 100\n    thousand = 1000\n    million = 1000000\n\n@zig_enum()\nclass Suit(ZigEnum):\n    clubs = auto()\n    spades = auto()\n    diamonds = auto()\n    hearts = auto()\n\n    Self: Const[Infer] = This()\n\n    def isClubs(self: Self) -> bool:\n        return self == Suit.clubs",
    zig: "const Value2 = enum(u32) {\n    hundred = 100,\n    thousand = 1000,\n    million = 1000000,\n};\nconst Suit = enum {\n    clubs,\n    spades,\n    diamonds,\n    hearts,\n    const Self = @This();\n    pub fn isClubs(\n        self: Self,\n    ) bool {\n        return self == Suit.clubs;\n    }\n};",
    explanation:
      "<p>The <code>@zig_enum</code> decorator translates a Python class into a Zig <code>enum</code>.</p><ul><li><b>Tag Type:</b> Inheriting from a type like <code>u32</code> sets the enum's underlying integer type: <code>enum(u32)</code>.</li><li><b>Values:</b> Explicit integer values can be assigned. The <code>auto()</code> function provides automatic sequential numbering starting from 0.</li><li><b>Methods:</b> Methods can be defined within the enum, using <code>This()</code> to get a reference to the enum type itself (which becomes <code>@This()</code>).</li></ul>",
  },
  {
    title: "Tagged Unions",
    python:
      "@zig_enum()\nclass ComplexTypeTag(ZigEnum):\n    ok = auto()\n    not_ok = auto()\n\n\n@zig_union(tag='ComplexTypeTag')\nclass ComplexType(ZigTaggedUnion):\n    ok: u8\n    not_ok: void",
    zig: "const ComplexTypeTag = enum {\n    ok,\n    not_ok,\n};\nconst ComplexType = union(ComplexTypeTag) {\n    ok: u8,\n    not_ok: void,\n};",
    explanation:
      "<p>This shows a tagged union, where an enum (<code>ComplexTypeTag</code>) specifies which field of the union is active.</p><ul><li>The <code>@zig_union(tag='ComplexTypeTag')</code> decorator translates to <code>union(ComplexTypeTag)</code>.</li><li>This creates a data structure that can hold either a <code>u8</code> (when the tag is <code>.ok</code>) or nothing (when the tag is <code>.not_ok</code>), while ensuring type safety by always tracking the active field.</li></ul>",
  },
  {
    title: "Switching on Tagged Unions",
    python:
      '@zig()\ndef switch_on_tagged_union() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    expect: Const[Infer] = std.testing.expect\n\n    c: Const[ComplexType] = {ok: 42}\n    Try(expect(As(ComplexTypeTag, c) == ComplexTypeTag.ok))\n\n    match c:\n        case enum(ok) as value:\n            Try(expect(value == 42))\n        case enum(not_ok):\n            unreachable()',
    zig: 'pub fn switch_on_tagged_union() anyerror!void {\n    const std = @import("std");\n    const expect = std.testing.expect;\n    const c: ComplexType = .{ .ok = 42 };\n    try (expect(@as(ComplexTypeTag, c) == ComplexTypeTag.ok));\n    switch (c) {\n        .ok => |value| {\n            try (expect(value == 42));\n        },\n        .not_ok => {\n            unreachable;\n        },\n    }\n}',
    explanation:
      "<p>The Python <code>match</code> statement is the primary way to interact with tagged unions.</p><ul><li>The syntax <code>case enum(ok) as value:</code> translates to Zig's payload capture syntax: <code>.ok => |value| { ... }</code>.</li><li>This safely unwraps the value of the active field (<code>ok</code>) into the <code>value</code> variable, which is only available within that specific case block.</li><li>The compiler enforces that all possible tags of the union are handled in the switch.</li></ul>",
  },
  {
    title: "Lexical Scoping with Blocks",
    python:
      "@zig()\ndef access_variable_after_block_scope() -> void:\n    with block:\n        x: Var[i32] = 1\n        _ = ref(x)",
    zig: "pub fn access_variable_after_block_scope() void {\n    {\n        var x: i32 = 1;\n        _ = &x;\n    }\n}",
    explanation:
      "<p>The <code>with block:</code> statement creates a new lexical scope, which is translated to a simple <code>{...}</code> block in Zig. Variables declared inside this block, like <code>x</code>, are destroyed and become inaccessible once the scope is exited. This is useful for managing variable lifetimes and preventing name collisions.</p>",
  },
  {
    title: "Labeled Blocks as Expressions",
    python:
      '@zig()\ndef labeled_block_expression() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    expect: Const[Infer] = std.testing.expect\n\n    y: Var[i32] = 123\n    x: Const[Infer] = _\n    with block(blk1):\n        y += 1\n        break_return(blk1, y)\n\n    Try(expect(x == 124))\n    Try(expect(y == 124))',
    zig: 'pub fn labeled_block_expression() anyerror!void {\n    const std = @import("std");\n    const expect = std.testing.expect;\n    var y: i32 = 123;\n    const x = blk1: {\n        y += 1;\n        break :blk1 y;\n    };\n    try (expect(x == 124));\n    try (expect(y == 124));\n}',
    explanation:
      "<p>A labeled block can be used as an expression in Zig, allowing a multi-statement computation to produce a single value.</p><ul><li><code>with block(label):</code> becomes <code>label: {...}</code>.</li><li>The special function <code>break_return(label, value)</code> is translated to <code>break :label value</code>.</li><li>This exits the labeled block and causes the entire block expression to evaluate to <code>value</code>, which is then assigned to <code>x</code>.</li></ul>",
  },
  {
    title: "Advanced Switch Statements",
    python:
      '@zig()\ndef switch_simple() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    expect: Const[Infer] = std.testing.expect\n\n    a: Const[u64] = 10\n    zz: Const[u64] = 103\n\n    b: Const[Infer] = _\n    match a:\n        case 1, 2, 3:\n            break_return(0)\n        case range_incl(5, 100):\n            break_return(1)\n        case comptime(zz):\n            break_return(zz)\n        case _:\n            break_return(9)',
    zig: 'pub fn switch_simple() anyerror!void {\n    const std = @import("std");\n    const expect = std.testing.expect;\n    const a: u64 = 10;\n    const zz: u64 = 103;\n    const b = switch (a) {\n        1,\n        2,\n        3,\n        => blk: {\n            break :blk 0;\n        },\n        5...100 => blk: {\n            break :blk 1;\n        },\n        zz => blk: {\n            break :blk zz;\n        },\n        else => blk: {\n            break :blk 9;\n        },\n    };',
    explanation:
      "<p>This shows advanced features of Zig's <code>switch</code> statement, which can be used as an expression.</p><ul><li><b>Multiple Items:</b> <code>case 1, 2, 3:</code> combines multiple values into a single branch.</li><li><b>Ranges:</b> <code>case range_incl(5, 100):</code> becomes an inclusive range pattern <code>5...100</code>.</li><li><b>Comptime Values:</b> <code>case comptime(zz):</code> uses a compile-time known variable as a case.</li><li><b>Else:</b> The wildcard <code>case _:</code> becomes the mandatory <code>else</code> prong.</li></ul>",
  },
  {
    title: "Compile-Time Metaprogramming",
    python:
      "@ zig(export=False)\ndef with_switch(any: AnySlice) -> usize:\n    ret: Const[Infer] = _\n    match any:\n        case inline(_) as slice:\n            break_return(slice.len)\n    return ret",
    zig: "pub fn with_switch(\n    any: AnySlice,\n) usize {\n    const ret = switch (any) {\n        inline else => |slice| blk: {\n            break :blk slice.len;\n        },\n    };\n    return ret;\n}",
    explanation:
      "<p>This demonstrates a powerful metaprogramming technique for working with unions.</p><ul><li>The Python syntax <code>case inline(_) as slice:</code> translates to Zig's <code>inline else => |slice|</code>.</li><li>The <code>inline else</code> prong in a switch statement automatically generates a case for every possible tag of the union that wasn't explicitly handled.</li><li>This allows writing generic code that works on any field of the union, as long as they share a common interface (like the <code>.len</code> property here). The compiler unrolls this into a separate case for each field.</li></ul>",
  },
  {
    title: "While Loop with Optional Capture",
    python:
      '@zig()\ndef while_null_capture() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    expect: Const[Infer] = std.testing.expect\n\n    sum1: Var[u32] = 0\n    EventuallyNullSequence.numbers_left = 3\n    while capture(EventuallyNullSequence.eventuallyNullSequence(), value):\n        sum1 += value\n    Try(expect(sum1 == 3))',
    zig: 'pub fn while_null_capture() anyerror!void {\n    const std = @import("std");\n    const expect = std.testing.expect;\n    var sum1: u32 = 0;\n    EventuallyNullSequence.numbers_left = 3;\n    while (EventuallyNullSequence.eventuallyNullSequence()) |value| {\n        sum1 += value;\n    }\n    try (expect(sum1 == 3));\n}',
    explanation:
      "<p>The <code>while capture(expr, var):</code> syntax is a special construct for looping over an expression that returns an optional value (<code>?T</code>).</p><p>It translates to Zig's idiomatic <code>while (expr) |var|</code> loop. This loop continues as long as the expression returns a non-null value, and it automatically unwraps the value into the <code>value</code> variable for use inside the loop body. The loop terminates when the expression returns <code>null</code>.</p>",
  },
  {
    title: "While Loop with Error Capture",
    python:
      "@zig()\ndef while_error_union_capture() -> Error[anyerror, void]:\n    std: Const[Infer] = Import(\"std\")\n    expect: Const[Infer] = std.testing.expect\n\n    sum1: Var[u32] = 0\n    EventuallyErrorSequence.numbers_left = 3\n    while capture_err(EventuallyErrorSequence.eventuallyErrorSequence(), value):\n        sum1 += value\n    else:  # Default error capture in else is 'err'\n        Try(expect(err == error.ReachedZero))",
    zig: 'pub fn while_error_union_capture() anyerror!void {\n    const std = @import("std");\n    const expect = std.testing.expect;\n    var sum1: u32 = 0;\n    EventuallyErrorSequence.numbers_left = 3;\n    while (EventuallyErrorSequence.eventuallyErrorSequence()) |value| {\n        sum1 += value;\n    } else |err| {\n        try (expect(err == error.ReachedZero));\n    }\n}',
    explanation:
      "<p>Similar to optional capture, <code>while capture_err(expr, var): ... else: ...</code> is for looping over an expression that returns an error union (<code>E!T</code>).</p><p>It translates to Zig's <code>while (expr) |var| ... else |err| ...</code>. The main loop body executes for each success payload. When the expression returns an error, the loop terminates and the <code>else</code> block is executed, with the error value captured in the <code>err</code> variable.</p>",
  },
  {
    title: "For Loop with Pointer Capture",
    python:
      '@zig()\ndef for_reference() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    expect: Const[Infer] = std.testing.expect\n\n    items: Var[Infer] = list([3, 4, 2], i32)\n\n    for (*value,) in ref(items):  # Pointer only works when passed as a tuple\n        value.deref += 1\n\n    Try(expect(items[0] == 4))\n    Try(expect(items[1] == 5))\n    Try(expect(items[2] == 3))',
    zig: 'pub fn for_reference() anyerror!void {\n    const std = @import("std");\n    const expect = std.testing.expect;\n    var items = [_]i32{ 3, 4, 2 };\n    for (&items) |*value| {\n        value.* += 1;\n    }\n    try (expect(items[0] == 4));\n    try (expect(items[1] == 5));\n    try (expect(items[2] == 3));\n}',
    explanation:
      "<p>To iterate over an array by reference and modify its elements, the Python code iterates over <code>ref(items)</code> and captures a pointer <code>*value</code>.</p><p>This translates to <code>for (&items) |*value|</code> in Zig. In each iteration, <code>value</code> is a pointer to an element in the <code>items</code> array. It can be dereferenced (<code>value.*</code>) to read or modify the original array's data directly.</p>",
  },
  {
    title: "If with Error Union Capture",
    python:
      '@zig()\ndef if_error_union() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    expect: Const[Infer] = std.testing.expect\n\n    a: Const[Error[anyerror, u32]] = 0\n    if capture_err(a, value, err):\n        Try(expect(value == 0))\n    else:\n        _ = err\n        unreachable()\n\n    b: Const[Error[anyerror, u32]] = error.BadValue\n    if capture_err(b, value, err):\n        _ = value\n        unreachable()\n    else:\n        Try(expect(err == error.BadValue))',
    zig: 'pub fn if_error_union() anyerror!void {\n    const std = @import("std");\n    const expect = std.testing.expect;\n    const a: anyerror!u32 = 0;\n    if (a) |value| {\n        try (expect(value == 0));\n    } else |err| {\n        _ = err;\n        unreachable;\n    }\n    const b: anyerror!u32 = error.BadValue;\n    if (b) |value| {\n        _ = value;\n        unreachable;\n    } else |err| {\n        try (expect(err == error.BadValue));\n    }\n}',
    explanation:
      "<p>The <code>if capture_err(expr, val, err):</code> construct is the primary way to handle error unions without propagating them.</p><p>It translates to Zig's <code>if (expr) |val| ... else |err| ...</code> payload capture syntax. If the expression <code>a</code> contains a success value, the <code>if</code> block is executed and the value is captured in <code>value</code>. If it contains an error, the <code>else</code> block is executed and the error is captured in <code>err</code>.</p>",
  },
  {
    title: "Defer and Errdefer",
    python:
      '@zig()\ndef defer_example() -> Error[anyerror, usize]:\n    std: Const[Infer] = Import("std")\n    expect: Const[Infer] = std.testing.expect\n\n    a: Var[usize] = 1\n\n    with block:\n        with defer:\n            a = 2\n        a = 1\n\n    Try(expect(a == 2))',
    zig: 'pub fn defer_example() anyerror!usize {\n    const std = @import("std");\n    const expect = std.testing.expect;\n    var a: usize = 1;\n    {\n        defer {\n            a = 2;\n        }\n        a = 1;\n    }\n    try (expect(a == 2));\n}',
    explanation:
      "<p>The <code>with defer:</code> statement is translated to a <code>defer</code> statement in Zig. The code inside the <code>defer</code> block is guaranteed to be executed when the current scope is exited, regardless of how it is exited (e.g., normal completion, a <code>return</code>, or an error).</p><p>A related construct, <code>with errdefer:</code>, translates to <code>errdefer</code>, which only executes if the scope is exited due to an error.</p>",
  },
  {
    title: "Function Pointers",
    python:
      '@zig_struct()\nclass Call2Op(ZigStruct):\n    fnCall: Const[Infer] = type(Ptr[Const[Callable[[i8, i8], i8]]])\n\n\n@ zig(export=False)\ndef doOp(fnCall: Call2Op.fnCall, op1: i8, op2: i8) -> i8:\n    return fnCall(op1, op2)\n\n\n@ zig()\ndef function() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    expect: Const[Infer] = std.testing.expect\n    # Force the function to be compiled, (workaround for function ptrs)\n    _ = add(0, 1)\n    _ = sub2(0, 1)\n\n    Try(expect(doOp(add, 5, 6) == 11))\n    Try(expect(doOp(sub2, 5, 6) == -1))',
    zig: 'const Call2Op = extern struct {\n    const fnCall = *const fn (i8, i8) i8;\n};\n\npub fn doOp(\n    fnCall: Call2Op.fnCall,\n    op1: i8,\n    op2: i8,\n) i8 {\n    return fnCall(op1, op2);\n}\n\npub fn function() anyerror!void {\n    const std = @import("std");\n    const expect = std.testing.expect;\n    _ = add(0, 1);\n    _ = sub2(0, 1);\n    try (expect(doOp(add, 5, 6) == 11));\n    try (expect(doOp(sub2, 5, 6) == (-1)));\n}',
    explanation:
      "<p>This block demonstrates passing functions as arguments using function pointers.</p><ul><li>The Python type hint <code>Callable[[i8, i8], i8]</code> is used within a <code>Ptr</code> to define a function pointer type. This is translated to the Zig function pointer type <code>*const fn (i8, i8) i8</code>.</li><li>The <code>doOp</code> function takes such a pointer and calls it like a regular function.</li><li>The main <code>function</code> then passes the previously defined <code>add</code> and <code>sub2</code> functions to <code>doOp</code>, demonstrating first-class functions.</li></ul>",
  },
  {
    title: "Generic Functions with `anytype`",
    python:
      '@zig(export=False)\ndef add_forty_two(T: anytype) -> TypeOf(T):\n    return T + 42\n\n\n@zig()\ndef fn_type_inference() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    expect: Const[Infer] = std.testing.expect\n\n    Try(expect(add_forty_two(1) == 43))\n    Try(expect(TypeOf(add_forty_two(1)) == comptime_int))\n    y: Const[i64] = 2\n    Try(expect(add_forty_two(y) == 44))\n    Try(expect(TypeOf(add_forty_two(y)) == i64))',
    zig: 'pub fn add_forty_two(\n    T: anytype,\n) @TypeOf(T) {\n    return (T + 42);\n}\n\npub fn fn_type_inference() anyerror!void {\n    const std = @import("std");\n    const expect = std.testing.expect;\n    try (expect(add_forty_two(1) == 43));\n    try (expect(@TypeOf(add_forty_two(1)) == comptime_int));\n    const y: i64 = 2;\n    try (expect(add_forty_two(y) == 44));\n    try (expect(@TypeOf(add_forty_two(y)) == i64));\n}',
    explanation:
      "<p>This demonstrates a generic function using Zig's <code>anytype</code>.</p><ul><li>The parameter <code>T: anytype</code> allows the function to accept an argument of any type.</li><li>The return type <code>TypeOf(T)</code> (which becomes <code>@TypeOf(T)</code>) is inferred based on the type of the argument passed at the call site.</li><li>When called with a compile-time integer literal like <code>1</code>, the result is a <code>comptime_int</code>. When called with a variable of type <code>i64</code>, the result is an <code>i64</code>.</li></ul>",
  },
  {
    title: "Error Set Coercion and Merging",
    python:
      "@zig_error()\nclass A(ZigError):\n    NotDir = auto()\n    PathNotFound = auto()\n\n\n@zig_error()\nclass B(ZigError):\n    OutOfMemory = auto()\n    PathNotFound = auto()\n\n\n@zig_struct()\nclass MergeErrorSets(ZigStruct):\n    C: Const[Infer] = Union[A, B]\n\n    def foo() -> Error[C, void]:\n        return error.NotDir",
    zig: "const A = error{\n    NotDir,\n    PathNotFound,\n};\nconst B = error{\n    OutOfMemory,\n    PathNotFound,\n};\nconst MergeErrorSets = extern struct {\n    const C = A || B;\n    pub fn foo() C!void {\n        return error.NotDir;\n    }\n};",
    explanation:
      "<p>This block shows how error sets can be manipulated.</p><ul><li>The <code>@zig_error</code> decorator translates a class into a Zig <code>error</code> set.</li><li>The <code>Union[A, B]</code> type hint, when used with error sets, is translated to the error set merge operator <code>A || B</code> in Zig. This creates a new error set <code>C</code> containing all unique errors from both <code>A</code> and <code>B</code>.</li><li>A function returning an error from a smaller set can be implicitly coerced to a function returning an error from a larger, superset.</li></ul>",
  },
  {
    title: "Error Handling with `catch`",
    python:
      "@zig(export=False)\ndef do_a_thing(str: Slice[Const[u8]]) -> void:\n    number: Const[Infer] = parse_u64(str, 10) @ catch(13)\n    _ = number\n\n\n@zig(export=False)\ndef do_a_thing2(str: Slice[Const[u8]]) -> void:\n    number: Const[Infer] = parse_u64(str, 10) @ catch(_)\n    with block(blk):\n        break_return(blk, 13)\n    _ = number",
    zig: "pub fn do_a_thing(\n    str: []const u8,\n) void {\n    const number = (parse_u64(str, 10) catch 13);\n    _ = number;\n}\n\npub fn do_a_thing2(\n    str: []const u8,\n) void {\n    const number = parse_u64(str, 10) catch blk: {\n        break :blk 13;\n    };\n    _ = number;\n}",
    explanation:
      "<p>The custom <code>@ catch</code> operator provides a concise way to handle errors without a full <code>if/else</code> block.</p><ul><li><code>expr @ catch(fallback)</code> translates to <code>expr catch fallback</code>. If <code>expr</code> returns an error, the entire expression evaluates to the <code>fallback</code> value.</li><li><code>expr @ catch(_): ...</code> translates to <code>expr catch |err| ...</code>, allowing for a block of code to run on error. The example uses a labeled block to return a value from the catch block.</li></ul>",
  },
  {
    title: "Implicit Type Coercion and Widening",
    python:
      '@zig()\ndef integer_widening() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    testing: Const[Infer] = std.testing\n\n    a: Const[u8] = 250\n    b: Const[u16] = a\n    c: Const[u32] = b\n    d: Const[u64] = c\n    e: Const[u64] = d\n    f: Const[u128] = e\n\n    Try(testing.expect(f == a))',
    zig: 'pub fn integer_widening() anyerror!void {\n    const std = @import("std");\n    const testing = std.testing;\n    const a: u8 = 250;\n    const b: u16 = a;\n    const c: u32 = b;\n    const d: u64 = c;\n    const e: u64 = d;\n    const f: u128 = e;\n    try (testing.expect(f == a));\n}',
    explanation:
      "<p>Zig allows implicit widening conversions, where a value of one type is assigned to a variable of a larger type without an explicit cast, as long as no information is lost.</p><p>This example shows a <code>u8</code> being progressively widened to <code>u16</code>, <code>u32</code>, <code>u64</code>, and finally <code>u128</code>. The transpiler mirrors this behavior, allowing direct assignment in the Python code.</p>",
  },
  {
    title: "Coercion to Slices and Pointers",
    python:
      '@zig()\ndef cast_to_slice() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    testing: Const[Infer] = std.testing\n\n    x1: Const[Slice[Const[u8]]] = "hello"\n    x2: Const[Slice[Const[u8]]] = ref(list([104, 101, 108, 108, 111], u8))\n    Try @ testing.expect(std.mem.eql(u8, x1, x2))\n\n\n@zig()\ndef cast_single_item_ptr_to_many_item_ptr() -> Error[anyerror, void]:\n    std: Const[Infer] = Import("std")\n    testing: Const[Infer] = std.testing\n\n    x2: Var[i32] = 1234\n    y: Const[Ptr[Array[1, i32]]] = ref(x2)\n    z: Const[Array[i32]] = y\n    Try @ testing.expect(z[0] == 1234)',
    zig: 'pub fn cast_to_slice() anyerror!void {\n    const std = @import("std");\n    const testing = std.testing;\n    const x1: []const u8 = "hello";\n    const x2: []const u8 = &[_]u8{ 104, 101, 108, 108, 111 };\n    (try testing.expect(std.mem.eql(u8, x1, x2)));\n}\n\npub fn cast_single_item_ptr_to_many_item_ptr() anyerror!void {\n    const std = @import("std");\n    const testing = std.testing;\n    var x2: i32 = 1234;\n    const y: *[1]i32 = &x2;\n    const z: [*]i32 = y;\n    (try testing.expect(z[0] == 1234));\n}',
    explanation:
      '<p>This block shows various implicit coercions to slices and pointers.</p><ul><li>An array literal (like <code>"hello"</code>) or a pointer to an array can be coerced to a slice (<code>[]T</code>).</li><li>A pointer to a single item (<code>*T</code>) can be coerced to a pointer to an array of one (<code>*[1]T</code>).</li><li>A pointer to a sized array (<code>*[N]T</code>) can be coerced to a many-item pointer (<code>[*]T</code>).</li></ul><p>The <code>@</code> operator is a shorthand for <code>Try()</code>.</p>',
  },
  {
    title: "Coercion between Unions and Enums",
    python:
      "@zig_enum()\nclass E(ZigEnum):\n    one = auto()\n    two = auto()\n    three = auto()\n\n\n@zig_union(tag='E')\nclass U(ZigTaggedUnion):\n    one: i32\n    two: f32\n    three: void\n\n\n@zig()\ndef coercion_between_unions_and_enums() -> Error[anyerror, void]:\n    std: Const[Infer] = Import(\"std\")\n    testing: Const[Infer] = std.testing\n\n    u: Const[U] = {two: 12.34}\n    e: Const[E] = u\n    Try(testing.expect(e == E.two))\n\n    three_: Const[E] = E.three\n    u_2: Const[U] = three_\n    Try(testing.expect(u_2 == E.three))",
    zig: 'const E = enum {\n    one,\n    two,\n    three,\n};\nconst U = union(E) {\n    one: i32,\n    two: f32,\n    three: void,\n};\n\npub fn coercion_between_unions_and_enums() anyerror!void {\n    const std = @import("std");\n    const testing = std.testing;\n    const u: U = .{ .two = 12.34 };\n    const e: E = u;\n    try (testing.expect(e == E.two));\n    const three_: E = E.three;\n    const u_2: U = three_;\n    try (testing.expect(u_2 == E.three));\n}',
    explanation:
      "<p>This block demonstrates the implicit coercions between a tagged union and its tag enum.</p><ul><li>A union value can be coerced to its enum tag type. In the example, <code>u</code> (which has the active tag <code>.two</code>) is assigned to <code>e</code>, and <code>e</code> becomes <code>E.two</code>.</li><li>An enum value can be coerced to its corresponding union type, which activates the field with the same name. This only works if the corresponding union field has the type <code>void</code>, as is the case for <code>.three</code>.</li></ul>",
  },
];

export function Blog() {
  useEffect(() => {
    // This is a workaround because direct imports are failing in this environment.
    // In a real build setup (like Next.js/Vite), you'd use direct imports.
    const loadScript = (src, onLoad) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = onLoad;
      document.body.appendChild(script);
    };

    if (!window.hljs) {
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js",
        () => {
          loadScript(
            "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/zig.min.js",
            () => {
              window.hljs.highlightAll();
            },
          );
        },
      );
    } else {
      window.hljs.highlightAll();
    }
  }, []);

  // Chart.js Configuration
  const commonTooltipCallback = {
    title: function (tooltipItems) {
      const item = tooltipItems[0];
      let label = item.chart.data.labels[item.dataIndex];
      return Array.isArray(label) ? label.join(" ") : label;
    },
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: commonTooltipCallback,
        backgroundColor: "#1E293B",
        titleColor: "#F1F5F9",
        bodyColor: "#CBD5E1",
        padding: 10,
        cornerRadius: 4,
        borderColor: "#334155",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#94A3B8", font: { weight: "600" } },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#94A3B8", font: { weight: "600" } },
      },
    },
  };

  const matmulData = {
    labels: ["Pure Python", "Zyg"],
    datasets: [
      {
        label: "GFLOP/s",
        data: [0.00263464550290962, 8.997371987654624],
        backgroundColor: ["#4B5563", "#F97316"],
        borderColor: ["#6B7280", "#FB923C"],
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const nsieveData = {
    labels: ["Pure Python", "Zyg"],
    datasets: [
      {
        label: "Time (s)",
        data: [1.428470553997613, 0.07604879399877973],
        backgroundColor: ["#4B5563", "#F97316"],
        borderColor: ["#6B7280", "#FB923C"],
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const TranslationBlock = ({ title, python, zig, explanation }) => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6">
          <CodeWindow title="Python" language="python" code={python} />
          <CodeWindow title="Zig" language="zig" code={zig} />
        </div>

        <Card className="lg:col-span-6 h-full">
          <h5 className="font-semibold text-highlight mb-2">{title}</h5>
          <div
            className="leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_code]:bg-slate-700/50 [&_code]:text-amber-300 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:font-mono"
            dangerouslySetInnerHTML={{ __html: explanation }}
          />
        </Card>
      </div>
    );
  };
  return (
    <div className="font-sans antialiased">
      <style>
        {`.text-accent-python { color: #FACC15; }
                .text-accent-zig { color: #F97316; }
                .bg-card { background-color: #0000002b; }
                .bg-subtle { background-color: #334155; }
                .text-highlight { color: #60A5FA; }
                .border-highlight { border-color: #60A5FA; }
                .flow-arrow { animation: pulse-arrow 2s infinite; }
                @keyframes pulse-arrow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.05); }
                }
                .hljs { background: #020617 !important; color: #E2E8F0 !important; }
                `}
      </style>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-12">
        <section id="problem">
          <p>
            I recently switched to Zig for pretty much anything that required
            speed. So much so that programming in any other language kinda
            became annoying at some point. So whenever I wanted to start a new
            project, I started thinking about how I could use Zig for it. But,
            being an ML researcher, I spent most of my days writing or debugging
            Python code. So naturally, I thought, “Well, Python already uses
            C/C++ under the hood, and so do most Python libraries.” I should be
            able to write Zig code and then call it from Python, right? And I
            could—but it was a pain. I had to write C bindings, compile the
            code, and then link it with Python. It was a lot of work just to get
            some speed.
          </p>
          <p>
            I also got the compiler “bug” recently. I was writing and building
            multiple compiler projects for fun, and I was really enjoying the
            process of writing code that could transform other code. I thought,
            what if I could write a compiler that would take my Python code and
            turn it into Zig? At the time, performance was never on my mind. I
            just thought it was a fun idea to do.{" "}
          </p>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">The Performance Problem</h2>
            <p className="mt-2 text-md ">
              Why leave the Python ecosystem just for speed?
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <AnimateOnScroll>
              <Card>
                <h3>The Traditional Path: C Extensions</h3>
                <p>
                  Rewriting slow Python code in C is effective but introduces
                  significant friction, turning a simple optimization into a
                  major project.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-slate-900/50 rounded-md">
                    <span className="text-red-400 mr-4 text-lg font-bold">
                      1
                    </span>
                    <div>
                      <span className="font-semibold">Manual C Coding:</span>{" "}
                      Manage memory and types by hand.
                    </div>
                  </div>
                  <div className="text-center text-2xl font-bold ">&darr;</div>
                  <div className="flex items-center p-3 bg-slate-900/50 rounded-md">
                    <span className="text-red-400 mr-4 text-lg font-bold">
                      2
                    </span>
                    <div>
                      <span className="font-semibold">FFI Boilerplate:</span>{" "}
                      Write Python/C API bindings.
                    </div>
                  </div>
                  <div className="text-center text-2xl font-bold ">&darr;</div>
                  <div className="flex items-center p-3 bg-slate-900/50 rounded-md">
                    <span className="text-red-400 mr-4 text-lg font-bold">
                      3
                    </span>
                    <div>
                      <span className="font-semibold">
                        Build Configuration:
                      </span>{" "}
                      Set up `setup.py` or Makefiles.
                    </div>
                  </div>
                  <div className="text-center text-2xl font-bold ">&darr;</div>
                  <div className="flex items-center p-3 bg-slate-900/50 rounded-md">
                    <span className="text-red-400 mr-4 text-lg font-bold">
                      4
                    </span>
                    <div className="">
                      <span className="font-semibold">Compile & Link:</span>{" "}
                      Generate the shared library.
                    </div>
                  </div>
                </div>
              </Card>
            </AnimateOnScroll>
            <AnimateOnScroll delay={100}>
              <Card>
                <h3>The "What If?" Moment</h3>
                <p>
                  This project started with a simple question: Can we get the
                  performance of a compiled language like Zig without disrupting
                  the Python workflow?
                </p>
                <div className="p-6 border-2 border-dashed border-highlight rounded-lg text-center bg-sky-900/20">
                  <p className="text-xl md:text-2xl font-semibold text-highlight">
                    What if a decorator could automatically transpile Python to
                    high-performance Zig?
                  </p>
                </div>
              </Card>
            </AnimateOnScroll>
          </div>
        </section>
        <section id="solution">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold ">
              The Zyg Transpilation Pipeline
            </h2>
            <p className="mt-2 text-md ">
              I've seen `triton` do something similar, so I thought why not.
              `zyg` intercepts Python code at runtime, converting it into a
              compiled library on the fly.
            </p>
          </div>
          <Card>
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 text-center">
              <div className="flex-1 p-4 bg-subtle rounded-lg flex items-center justify-center min-h-[60px]">
                <span className="font-mono text-sm text-accent-python font-semibold">
                  <code>@zig def my_func(...)</code>
                </span>
              </div>
              <div className="flex items-center justify-center text-3xl font-light  mx-4 flow-arrow">
                &rarr;
              </div>
              <div className="flex-1 p-4 bg-subtle rounded-lg flex items-center justify-center">
                <span className="font-semibold ">Python AST Parsing</span>
              </div>
              <div className="flex items-center justify-center text-3xl font-light  mx-4 flow-arrow">
                &rarr;
              </div>
              <div className="flex-1 p-4 bg-subtle rounded-lg flex items-center justify-center">
                <span className="font-semibold ">Zig Code Generation</span>
              </div>
              <div className="flex items-center justify-center text-3xl font-light  mx-4 flow-arrow">
                &rarr;
              </div>
              <div className="flex-1 p-4 bg-subtle rounded-lg flex items-center justify-center">
                <span className="font-semibold ">Dynamic Compilation</span>
              </div>
              <div className="flex items-center justify-center text-3xl font-light  mx-4 flow-arrow">
                &rarr;
              </div>
              <div className="flex-1 p-4 bg-subtle rounded-lg flex items-center justify-center">
                <span className="font-mono text-accent-zig font-semibold">
                  High-Speed Execution
                </span>
              </div>
            </div>
          </Card>
        </section>
        <section id="translation" className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Translation Deep Dive</h2>
            <p className="mt-2 text-md max-w-3xl mx-auto ">
              How do we translate a high-level, dynamic language like Python to
              a low-level, static one like Zig? The key is using Python's type
              hints to provide the necessary information. Let’s look at some
              examples to see how this works in practice.
            </p>
            {/* warning block */}
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-8">
              <div className="items-center">
                <span className="font-semibold">Warning: </span>
                All the design decisions on syntax and semantics were chosen on
                a whim. There was no deep thought or analysis behind them. And I
                don't intend to either. You are welcome though!!! <br /> <br />
                <strong>
                  {" "}
                  All of it was written on a saturday night, half asleep, so
                  take it as you will.
                </strong>
              </div>
            </div>
            <h4>
              With that said, let’s dive into some of the key translation
              patterns. And if you want to see some immediate performance
              comparisons, you can skip to{" "}
              <a href="#performance">Performance Benchmarks</a>.
            </h4>
          </div>
          <div className="space-y-12">
            {data.map((item, index) => (
              <TranslationBlock
                key={index}
                title={item.title}
                python={item.python}
                zig={item.zig}
                explanation={item.explanation}
              />
            ))}
          </div>

          {/* Performance Benchmarks */}
          <div className="text-center mt-24 mb-12">
            <h2 className="text-3xl font-bold" id="performance">
              Performance Benchmarks
            </h2>
            <p className="mt-2 text-md max-w-3xl mx-auto ">
              Let’s see how Zyg performs compared to pure Python
              implementations.
            </p>

            {/* Matmul */}
            <div className="flex flex-wrap md:flex-nowrap gap-8 justify-center">
              <div className="w-full md:w-1/2">
                <Card>
                  <h3 className="text-xl font-semibold mb-4 text-center">
                    MatMul GFLOP/s (2 128x128 Matrices)
                  </h3>

                  {/*~3400x faster*/}
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold text-accent-zig">
                      3,400x
                    </span>{" "}
                    faster than pure Python
                  </div>
                  <BarChart chartData={matmulData} options={chartOptions} />
                </Card>
              </div>
              <div className="w-full md:w-1/2">
                <Card>
                  <h3 className="text-xl font-semibold mb-4 text-center">
                    NSieve Time (s)
                  </h3>
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold text-accent-zig">
                      19x
                    </span>{" "}
                    faster than pure Python
                  </div>
                  <BarChart chartData={nsieveData} options={chartOptions} />
                </Card>
              </div>
            </div>
            <h4 className="text-md  mt-4">
              You can find the full benchmark code in the repo.
            </h4>
            {/* Link to the repo, with github repo viz */}
            {/* https://github.com/theunnecessarythings/zyg */}
            <div className="w-[200px] m-auto">
              <RepoCard username="theunnecessarythings" repository="zyg" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
