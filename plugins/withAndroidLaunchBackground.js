const { withAndroidStyles, withDangerousMod, AndroidConfig } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * After Android 12's icon splash exits, the activity window must already show
 * the full landing painting. Otherwise JS has to paint it and the user sees a gap.
 */
function withAndroidLaunchBackground(config, props = {}) {
  const image = props.image ?? './assets/landing-image.png';

  config = withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.projectRoot;
      const resDir = path.join(modConfig.modRequest.platformProjectRoot, 'app/src/main/res');
      const nodpiDir = path.join(resDir, 'drawable-nodpi');
      const drawableDir = path.join(resDir, 'drawable');
      fs.mkdirSync(nodpiDir, { recursive: true });
      fs.mkdirSync(drawableDir, { recursive: true });

      const src = path.resolve(projectRoot, image);
      if (!fs.existsSync(src)) {
        throw new Error(`withAndroidLaunchBackground: missing ${src}`);
      }
      fs.copyFileSync(src, path.join(nodpiDir, 'landing_splash.png'));

      fs.writeFileSync(
        path.join(drawableDir, 'launch_background.xml'),
        `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splashscreen_background" />
    <item>
        <bitmap
            android:gravity="fill"
            android:src="@drawable/landing_splash" />
    </item>
</layer-list>
`
      );
      return modConfig;
    },
  ]);

  config = withAndroidStyles(config, (modConfig) => {
    modConfig.modResults = AndroidConfig.Styles.assignStylesValue(modConfig.modResults, {
      add: true,
      parent: AndroidConfig.Styles.getAppThemeGroup(),
      name: 'android:windowBackground',
      value: '@drawable/launch_background',
    });
    return modConfig;
  });

  return config;
}

module.exports = withAndroidLaunchBackground;
