/**
 * apply-patches.js
 * Automatically applies necessary compatibility patches for RN 0.73 + macOS.
 */
const fs = require('fs');
const path = require('path');

// 1. Patch RNGestureHandlerButtonNativeComponent for RN 0.73 codegen
const ghSpecPath = path.join(
  __dirname,
  '../node_modules/react-native-gesture-handler/src/specs/RNGestureHandlerButtonNativeComponent.ts'
);

if (fs.existsSync(ghSpecPath)) {
  let content = fs.readFileSync(ghSpecPath, 'utf8');
  if (content.includes('CodegenTypes.Int32') || content.includes('CodegenTypes.WithDefault')) {
    content = `import { codegenNativeComponent } from 'react-native';
import type {
  HostComponent,
  ViewProps,
  ColorValue,
} from 'react-native';
import type {
  Int32,
  Float,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';

// @ts-ignore - Redefining pointerEvents with WithDefault for codegen, conflicts with ViewProps type but codegen needs it
interface NativeProps extends ViewProps {
  exclusive?: boolean;
  foreground?: boolean;
  borderless?: boolean;
  enabled?: boolean;
  rippleColor?: ColorValue;
  rippleRadius?: Int32;
  touchSoundDisabled?: boolean;
  borderWidth?: Float;
  borderColor?: ColorValue;
  borderStyle?: WithDefault<string, 'solid'>;
  pointerEvents?: WithDefault<
    'box-none' | 'none' | 'box-only' | 'auto',
    'auto'
  >;
}

export default codegenNativeComponent<NativeProps>(
  'RNGestureHandlerButton'
) as HostComponent<NativeProps>;
`;
    fs.writeFileSync(ghSpecPath, content);
    console.log('[Patch] Applied RNGestureHandlerButtonNativeComponent patch.');
  }
}

// 2. Patch NodeWatcher in metro-file-map for macOS EMFILE avoidance
const nodeWatcherPath = path.join(
  __dirname,
  '../node_modules/metro-file-map/src/watchers/NodeWatcher.js'
);

if (fs.existsSync(nodeWatcherPath)) {
  let content = fs.readFileSync(nodeWatcherPath, 'utf8');
  let modified = false;

  if (content.includes('if (this.watched[dir]) {')) {
    content = content.replace(
      'if (this.watched[dir]) {',
      "if (this.watched[dir] || dir.includes('node_modules')) {"
    );
    modified = true;
  }

  if (content.includes('error.code === "ENOENT" || (error.code === "EPERM" && platform === "win32")')) {
    content = content.replace(
      'error.code === "ENOENT" || (error.code === "EPERM" && platform === "win32")',
      'error.code === "ENOENT" || error.code === "EMFILE" || (error.code === "EPERM" && platform === "win32")'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(nodeWatcherPath, content);
    console.log('[Patch] Applied NodeWatcher patch.');
  }
}

// 3. Patch RNGH android/build.gradle for AGP 8.3/8.4 compatibility
const ghGradlePath = path.join(
  __dirname,
  '../node_modules/react-native-gesture-handler/android/build.gradle'
);

if (fs.existsSync(ghGradlePath)) {
  let content = fs.readFileSync(ghGradlePath, 'utf8');
  if (content.includes("directories.add('reanimated/src/main/java')")) {
    content = content
      .replace("directories.add('reanimated/src/main/java')", "srcDirs += 'reanimated/src/main/java'")
      .replace("directories.add('noreanimated/src/main/java')", "srcDirs += 'noreanimated/src/main/java'")
      .replace("directories.add('svg/src/main/java')", "srcDirs += 'svg/src/main/java'")
      .replace("directories.add('nosvg/src/main/java')", "srcDirs += 'nosvg/src/main/java'");
    fs.writeFileSync(ghGradlePath, content);
    console.log('[Patch] Applied RNGH android/build.gradle patch.');
  }
}

console.log('[Patch] All patches verified.');
