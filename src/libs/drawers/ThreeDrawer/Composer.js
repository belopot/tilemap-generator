import {
  EffectComposer,
  RenderPass,
  VignetteEffect,
  BrightnessContrastEffect,
  SMAAEffect,
  BloomEffect,
  HueSaturationEffect,
  NormalPass,
  DepthDownsamplingPass,
  SSAOEffect,
  TextureEffect,
  EffectPass,
  SMAAPreset,
  EdgeDetectionMode,
  BlendFunction,
  KernelSize,
  PredicationMode,
  ShaderPass,
} from 'postprocessing';

import {CopyMaterial} from './CopyMaterial';

import {HalfFloatType} from 'three';

class Composer extends EffectComposer {
  constructor(renderer, scene, camera) {
    super(renderer, {
      frameBufferType: HalfFloatType,
    });

    const renderPass = new RenderPass(scene, camera);
    this.addPass(renderPass);

    //Vignette Effect
    const vignetteEffect = new VignetteEffect({
      eskil: false,
      offset: 0.1,
      darkness: 0.5,
    });
    this.vignetteEffect = vignetteEffect;

    //Brightness Contrast Effect
    const brightnessContrastEffect = new BrightnessContrastEffect({
      contrast: 0.1,
      brightness: 0,
    });
    this.brightnessContrastEffect = brightnessContrastEffect;

    //SMAA Effect
    const smaaEffect = new SMAAEffect();
    smaaEffect.edgeDetectionMaterial.edgeDetectionThreshold = 0.05;

    //Edge Detection Effect
    const edgesTextureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: smaaEffect.renderTargetEdges.texture,
    });

    const weightsTextureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: smaaEffect.renderTargetWeights.texture,
    });

    //Bloom Effect
    const bloomEffect = new BloomEffect({
      blendFunction: BlendFunction.SCREEN,
      kernelSize: KernelSize.MEDIUM,
      luminanceThreshold: 0.3,
      luminanceSmoothing: 0.83,
      height: 2048,
      intensity: 0.3,
      resolutionScale: 0.5,
    });
    this.bloomEffect = bloomEffect;

    //Hue Saturation Effect
    const hueSaturationEffect = new HueSaturationEffect({
      hue: 0.0,
      saturation: 0.191,
    });
    this.hueSaturationEffect = hueSaturationEffect;

    //Normal Pass Effect
    const normalPass = new NormalPass(scene, camera);
    const depthDownsamplingPass = new DepthDownsamplingPass({
      normalBuffer: normalPass.texture,
      resolutionScale: 0.5,
    });
    const normalDepthBuffer = renderer.capabilities.isWebGL2 ? depthDownsamplingPass.texture : null;

    //SSAO Effect
    // Note: Thresholds and falloff correspond to camera near/far.
    // Example: worldDistance = distanceThreshold * (camera.far - camera.near)
    const ssaoEffect = new SSAOEffect(camera, normalPass.texture, {
      blendFunction: BlendFunction.MULTIPLY,
      distanceScaling: true,
      depthAwareUpsampling: true,
      normalDepthBuffer,
      samples: 9,
      rings: 7,
      distanceThreshold: 0.02, // Render up to a distance of ~20 world units
      distanceFalloff: 0.0025, // with an additional ~2.5 units of falloff.
      rangeThreshold: 0.0003, // Occlusion proximity of ~0.3 world units
      rangeFalloff: 0.0001, // with ~0.1 units of falloff.
      luminanceInfluence: 0.7,
      minRadiusScale: 0.33,
      radius: 0.1,
      intensity: 1.33,
      bias: 0.025,
      fade: 0.01,
      color: null,
      resolutionScale: 1,
    });
    this.ssaoEffect = ssaoEffect;

    //Copy Pass
    const copyPass = new ShaderPass(new CopyMaterial());

    const effectPass = new EffectPass(
      camera,
      // bloomEffect,
      // smaaEffect,
      // edgesTextureEffect,
      // weightsTextureEffect,
      // ssaoEffect,
      // vignetteEffect,
      // brightnessContrastEffect,
      // hueSaturationEffect,
    );

    this.addPass(normalPass);
    if (renderer.capabilities.isWebGL2) {
      this.addPass(depthDownsamplingPass);
    } else {
      console.log('WebGL 2 not supported, falling back to naive depth downsampling');
    }

    copyPass.enabled = false;
    copyPass.renderToScreen = true;
    effectPass.renderToScreen = true;

    this.addPass(copyPass);
    this.addPass(effectPass);
  }
}

export default Composer;
