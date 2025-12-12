import {test, expect} from '@playwright/test';

// eslint-disable-next-line no-empty-pattern
test.beforeEach(async ({}, testInfo) => {
  testInfo.snapshotPath = (name: string) => `${testInfo.file}-snapshots/${name}`;
});

test('Basic Emitter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/simple_test/index.html');
  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('statc-emitter.png', {
    maxDiffPixels: 110,
  });
});

test('Type setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_type/index.html');
  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_type.png', {
    maxDiffPixels: 110,
  });
});

test('isStatic setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_isStatic/index.html');
  // We set isStatic to false in the constructor, and immediately set it to true.
  // We then wait a random amount of time to ensure that the it's only the first frame that is rendered.
  await page.waitForTimeout(5000 * Math.random());
  await expect(page).toHaveScreenshot('emitter_parameter_isStatic.png', {
    maxDiffPixels: 110,
  });
});

test('Duration setter parameter (1s)', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_duration_1/index.html');
  // There should be no more particles left, as the duration is 1.
  await page.waitForTimeout(20000);
  await expect(page).toHaveScreenshot('emitter_parameter_duration_1.png', {
    maxDiffPixels: 110,
  });
});

test('direction setter parameter (1)', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_direction/index.html');

  await page.waitForTimeout(11000);
  await expect(page).toHaveScreenshot('emitter_parameter_direction.png', {
    maxDiffPixels: 200,
  });
});

test('position value setter parameter(z = 10)', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_position_value/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_position_value.png', {
    maxDiffPixels: 110,
  });
});

test('position spread setter parameter(0,0,0)', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_position_spread/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_position_spread.png', {
    maxDiffPixels: 110,
  });
});

test('position spread clamp setter parameter(1,1,1), (1,1,1)', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_position_spreadClamp/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_position_spreadClamp.png', {maxDiffPixels: 110});
});

test('position radius setter parameter (0.1)', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_position_radius/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_position_radius.png', {
    maxDiffPixels: 110,
  });
});

test('distribution (line) setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_position_distribution/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_position_distribution.png', {maxDiffPixels: 110});
});

test('randomize position setter parameter', async ({page}) => {
  test.fail();
  await page.goto('http://localhost:5173/demo/emitter_parameter_position_randomize/index.html');
  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_position_randomize.png', {maxDiffPixels: 110});
});

test('velocity value setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_velocity_value/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_velocity_value.png', {
    maxDiffPixels: 110,
  });
});

test('rotation angle setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_rotation_angle/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_rotation_angle.png', {
    maxDiffPixels: 110,
  });
});

test('rotation angleSpread setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_rotation_angleSpread/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_rotation_angleSpread.png', {maxDiffPixels: 110});
});

test('rotation axis setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_rotation_axis/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_rotation_axis.png' ,{ maxDiffPixels: 110 });
});

test('rotation axisSpread setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_rotation_axisSpread/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_rotation_axisSpread.png', {maxDiffPixels: 110});
});

test('rotation randomize setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_rotation_randomize/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_rotation_randomize.png' ,{ maxDiffPixels: 110 });
});

test('rotation static setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_rotation_static/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_rotation_static.png', {
    maxDiffPixels: 110,
  });
});

//emitter_parameter_velocity_spread
test('velocity spread setter parameter', async ({page}) => {
  //! Works but seems to be inconsistent.
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_velocity_spread/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_velocity_spread.png' ,{ maxDiffPixels: 110 });
});

//emitter_parameter_velocity_spread
test('velocity randomize setter parameter', async ({page}) => {
  //! Works but seems to be inconsistent.
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_velocity_randomize/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_velocity_randomize.png' ,{ maxDiffPixels: 110 });
});

//emitter_parameter_velocity_distribution
test('velocity distribution setter parameter', async ({page}) => {
  //! Does not work.
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_velocity_distribution/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_velocity_distribution.png' ,{ maxDiffPixels: 110 });
});

//emitter_parameter_acceleration_value

test('acceleration value setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_acceleration_value/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_acceleration_value.png', {maxDiffPixels: 110});
});

test('acceleration spread setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_acceleration_spread/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_acceleration_spread.png' ,{ maxDiffPixels: 110 });
});

test('acceleration randomize setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_acceleration_randomize/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_acceleration_randomize.png' ,{ maxDiffPixels: 110 });
});

test('acceleration distribution setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_acceleration_distribution/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_acceleration_distribution.png', {maxDiffPixels: 110});
});

//!TODO Cant really figure out how to test this one.
const dragTests = ['emitter_parameter_drag_value', 'emitter_parameter_drag_spread', 'emitter_parameter_drag_randomise'];

dragTests.forEach(testName => {
  test(testName, async ({page}) => {
    test.fixme();
  });
});

//!TODO These are broken/delayed start
const wiggleTests = ['emitter_parameter_wiggle_value', 'emitter_parameter_wiggle_spread'];

wiggleTests.forEach(testName => {
  test(testName, async ({page}) => {
    test.fixme();
  });
});

test('orbit angle setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_orbit_angle/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_orbit_angle.png', {
    maxDiffPixels: 110,
  });
});

test('orbit angleSpread setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_orbit_angleSpread/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_orbit_angleSpread.png', {maxDiffPixels: 110});
});

test('orbit axis setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_orbit_axis/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_orbit_axis.png' ,{ maxDiffPixels: 110 });
});

test('orbit axisSpread setter parameter', async ({page}) => {
  // test.fixme();
  await page.goto('http://localhost:5173/demo/emitter_parameter_orbit_axisSpread/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_orbit_axisSpread.png', {maxDiffPixels: 110});
});

test('orbit center setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_orbit_center/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_orbit_center.png', {
    maxDiffPixels: 110,
  });
});

test('orbit randomize setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_orbit_randomize/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_orbit_randomize.png' ,{ maxDiffPixels: 110 });
});

//!
test('orbit static setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_orbit_static/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_orbit_static.png', {
    maxDiffPixels: 110,
  });
});

test('color value setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_color_value/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_color_value.png', {
    maxDiffPixels: 110,
  });
});

test('color spread setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_color_spread/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_color_spread.png', {
    maxDiffPixels: 110,
  });
});

test('color randomize setter parameter', async ({page}) => {
  test.fixme();
  //! Cant figure out how to test this one.
  // await page.goto('http://localhost:5173/demo/emitter_parameter_color_randomize/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_color_randomize.png' ,{ maxDiffPixels: 110 });
});

test('opacity value setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_opacity_value/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_opacity_value.png', {
    maxDiffPixels: 110,
  });
});

test('opacity spread setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/emitter_parameter_opacity_spread/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_opacity_spread.png', {
    maxDiffPixels: 110,
  });
});

test('opacity randomize setter parameter', async ({page}) => {
  test.fail();
  await page.goto('http://localhost:5173/demo/emitter_parameter_opacity_randomize/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_opacity_randomize.png', {maxDiffPixels: 110});
});

//! here

test('size value setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_size_value/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_size_randomize.png' ,{ maxDiffPixels: 110 });
});

test('size spread setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_size_spread/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_size_randomize.png' ,{ maxDiffPixels: 110 });
});

test('size randomize setter parameter', async ({page}) => {
  test.fail();
  await page.goto('http://localhost:5173/demo/emitter_parameter_size_randomize/index.html');

  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('emitter_parameter_size_randomize.png', {
    maxDiffPixels: 110,
  });
});

test('angle value setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_angle_value/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_angle_randomize.png' ,{ maxDiffPixels: 110 });
});

test('angle spread setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_angle_spread/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_angle_randomize.png' ,{ maxDiffPixels: 110 });
});

test('angle randomize setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/emitter_parameter_angle_randomize/index.html');

  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('emitter_parameter_angle_randomize.png' ,{ maxDiffPixels: 110 });
});

test('Texture value setter parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/group_parameter_texture_value/index.html');
  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('group_parameter_texture_value.png', {
    maxDiffPixels: 110,
  });
});

test('Texture frames setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_texture_frames/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_texture_frames.png' ,{ maxDiffPixels: 110 });
});

test('Texture frame count setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_texture_frame_count/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_texture_frame_count.png' ,{ maxDiffPixels: 110 });
});

test('Texture loop setter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_texture_frame_loop/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_texture_frame_loop.png' ,{ maxDiffPixels: 110 });
});

test('fixedTimeStepsetter parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_fixedTimeStep/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_fixedTimeStep.png' ,{ maxDiffPixels: 110 });
});

test('alphaTest parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_alphaTest/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_alphaTest.png' ,{ maxDiffPixels: 110 });
});

test('blending parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_blending/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_blending.png' ,{ maxDiffPixels: 110 });
});

test('colorize parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_colorize/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_colorize.png' ,{ maxDiffPixels: 110 });
});

test('depthTest parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_depthTest/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_depthTest.png' ,{ maxDiffPixels: 110 });
});

//
test('depthWrite parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_depthWrite/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_depthWrite.png' ,{ maxDiffPixels: 110 });
});

test('fog parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_fog/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_fog.png' ,{ maxDiffPixels: 110 });
});

test('hasPerspective parameter', async ({page}) => {
  //! this is broken
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_hasPerspective/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_hasPerspective.png' ,{ maxDiffPixels: 110 });
});

test('maxParticleCount parameter', async ({page}) => {
  await page.goto('http://localhost:5173/demo/group_parameter_maxParticleCount/index.html');
  await page.waitForTimeout(5000);
  await expect(page).toHaveScreenshot('group_parameter_maxParticleCount.png', {
    maxDiffPixels: 110,
  });
});

test('scale parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_scale/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_scale.png' ,{ maxDiffPixels: 110 });
});

//
test('transparent parameter', async ({page}) => {
  test.fixme();
  // await page.goto('http://localhost:5173/demo/group_parameter_transparent/index.html');
  // await page.waitForTimeout(5000);
  // await expect(page).toHaveScreenshot('group_parameter_transparent.png' ,{ maxDiffPixels: 110 });
});
