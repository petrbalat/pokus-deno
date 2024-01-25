import {
    EventType,
    WindowBuilder,
} from "https://deno.land/x/sdl2@0.8.0/mod.ts";

const win = new WindowBuilder("Hello, World!", 800, 600).build();

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

/* Returns a Deno.UnsafeWindowSurface */
const surface = win.windowSurface();
/* Returns a WebGPU GPUCanvasContext */
const context = surface.getContext("webgpu");

context.configure({/* ... */});

for (const event of win.events()) {
    if (event.type == EventType.Quit) break;

    // Sine wave
    const r = Math.sin(Date.now() / 1000) / 2 + 0.5;
    const g = Math.sin(Date.now() / 1000 + 2) / 2 + 0.5;
    const b = Math.sin(Date.now() / 1000 + 4) / 2 + 0.5;

    const textureView = context.getCurrentTexture().createView();
    const renderPassDescriptor = {
        colorAttachments: [
            {
                view: textureView,
                clearValue: { r, g, b, a: 1.0 },
                loadOp: "clear",
                storeOp: "store",
            },
        ],
    };

    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
    surface.present();
}
