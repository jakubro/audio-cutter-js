$(document).ready(function () {
  'use strict';

  var createForm, config, maxLength, $form, $play, $pause, $stop, $save,
    $songLength, $regionLength, togglePlaying, togglePaused, wavesurfer,
    initialPeaks, getRegionLengthText, toMinutesAndSeconds, round, padLeft;

  /**
   * Dynamically create HTML form (<form>),
   * with 'action' and 'method' as attributes,
   * and with <input> for each key in 'inputs'.
   */
  createForm = function(action, method, inputs) {
    var $form, name, $input;
    $form = $('<form></form>');
    $form.attr('action', action);
    $form.attr('method', method);
    for (name in inputs) {
      if (inputs.hasOwnProperty(name)) {
        $input = $('<input type="hidden">');
        $input.attr('name', name);
        $input.attr('value', inputs[name] || '');
        $form.append($input);
      }
    }
    return $form;
  };

  round = function (val, precision) {
    if(typeof precision === 'undefined') {
      precision = 2;
    }
    return Math.round(val * Math.pow(10, precision)) / Math.pow(10, precision);
  };

  padLeft = function (value, pad) {
    return String(pad + value).slice(-pad.length);
  };

  toMinutesAndSeconds = function (totalSeconds) {
    var minutes, seconds;
    minutes = Math.floor(totalSeconds / 60);
    seconds = totalSeconds - minutes * 60;
    return {
      minutes: minutes,
      seconds: seconds
    };
  };

  getRegionLengthText = function (start, end) {
    var duration, startParsed, endParsed;
    duration = round(end - start);
    startParsed = toMinutesAndSeconds(start);
    endParsed = toMinutesAndSeconds(end);
    return duration + ' sec (' +
      padLeft(startParsed.minutes, '00') + ':' + padLeft(round(startParsed.seconds, 0), '00') + ' - ' +
      padLeft(endParsed.minutes, '00') + ':' + padLeft(round(endParsed.seconds, 0), '00') + ')';
  };

  /**
   * Configuration.
   */
  config = _songcut_config || {};

  /**
   * Max length of region in seconds.
   */
  maxLength = config.maxLength || 30;

  /**
   * Initial peaks (Fallback for old browsers).
   */
  initialPeaks = [
      [0.039185766130685806, -0.00274658203125, 0.041779838502407074, -0.00457763671875, 0.03625598922371864,
        -0.0084228515625, 0.021027252078056335, -0.06231689453125, 0.07425153255462646, -0.0069580078125,
        0.15704825520515442, -0.109527587890625, 0.12973418831825256, -0.069793701171875, 0.13669240474700928,
        -0.054840087890625, 0.1105990782380104, -0.0816650390625, 0.01071199681609869, -0.056121826171875,
        0.07730338722467422, -0.12896728515625, 0.014069032855331898, -0.053192138671875, 0.10916470736265182,
        -0.079071044921875, 0.10562456399202347, -0.354705810546875, 0.3563341200351715, -0.023040771484375,
        0.1427960991859436, -0.10369873046875, 0.061372723430395126, -0.18359375, 0.18625445663928986,
        -0.2891845703125, 0.2558366656303406, 0, 0.11246071010828018, -0.22564697265625, 0.09384441375732422,
        -0.04010009765625, 0.11389507353305817, -0.22735595703125, 0.08673360198736191, -0.14678955078125,
        0.09356974810361862, -0.252349853515625, 0.10895107686519623, -0.138885498046875, 0.08172857016324997,
        -0.058197021484375, 0.06106753647327423, -0.177093505859375, 0.09433270990848541, -0.0322265625,
        0.0718405693769455, -0.153350830078125, 0.33869442343711853, -0.250732421875, 0.16449476778507233,
        -0.014556884765625, 0.034394361078739166, -0.020782470703125, 0.0872524157166481, -0.023406982421875,
        0.13904233276844025, -0.12518310546875, 0.17618335783481598, -0.06707763671875, 0.110812708735466,
        -0.0548095703125, 0.06463820487260818, -0.1002197265625, 0.07293923944234848, -0.0604248046875,
        0.18744468688964844, -0.052276611328125, 0.11255226284265518, -0.135223388671875, 0.11795403808355331,
        -0.02374267578125, 0.08978545665740967, -0.051727294921875, 0.10495315492153168, -0.047119140625,
        0.06964323669672012, -0.0345458984375, 0.042329173535108566, -0.003692626953125, 0.050233468413352966,
        -0.033905029296875, 0.10473952442407608, -0.259033203125, 0.03595080226659775, -0.082275390625,
        0.10550248622894287, -0.2628173828125, 0.0319223627448082, -0.196319580078125, 0.23697622120380402,
        -0.02789306640625, 0, 0],
      [0.008362071588635445, -0.01422119140625, 0.0025940733030438423, -0.009490966796875, 0.00476088747382164,
        -0.017303466796875, 0.02075258642435074, -0.118927001953125, 0.11392559856176376, -0.081390380859375,
        0.3011871576309204, -0.195587158203125, 0.24942778050899506, -0.209381103515625, 0.27576524019241333,
        -0.117828369140625, 0.23410747945308685, -0.208709716796875, 0.0015564439818263054, -0.120574951171875,
        0.19293801486492157, -0.210540771484375, 0.009765923023223877, -0.124267578125, 0.22794274985790253,
        -0.1341552734375, 0.11484114825725555, -0.23834228515625, 0.32212287187576294, -0.07159423828125,
        0.10913418978452682, -0.135498046875, 0.1033661887049675, -0.241851806640625, 0.3165684938430786,
        -0.111968994140625, 0.06729331612586975, -0.054595947265625, 0.10187078267335892, -0.241119384765625,
        0.08838160336017609, -0.04010009765625, 0.10180974751710892, -0.242584228515625, 0.11832026392221451,
        -0.17645263671875, 0.13367107510566711, -0.349609375, 0.0796838253736496, -0.236572265625,
        0.07043671607971191, -0.107025146484375, 0.045716725289821625, -0.15985107421875, 0.0638142004609108,
        -0.04278564453125, 0.0239570289850235, -0.203582763671875, 0.2387768179178238, -0.130584716796875,
        0.08352915942668915, -0.129913330078125, 0.020416881889104843, -0.04022216796875, 0.1187475174665451,
        -0.063568115234375, 0.07257301360368729, -0.11541748046875, 0.17978453636169434, -0.092193603515625,
        0.2687459886074066, -0.09295654296875, 0.22647786140441895, -0.165771484375, 0.17322306334972382,
        -0.14068603515625, 0.03308206424117088, -0.114410400390625, 0.07760857045650482, -0.07080078125,
        0.07525864243507385, -0.02239990234375, 0.08832056820392609, -0.05230712890625, 0.043977171182632446,
        -0.09344482421875, 0.02233954891562462, -0.060577392578125, 0.0076601458713412285, -0.025421142578125,
        0.02386547438800335, -0.024200439453125, 0.07217627763748169, -0.2374267578125, 0.02148503065109253,
        -0.118316650390625, 0.07510605454444885, -0.237030029296875, 0.036194950342178345, -0.11895751953125,
        0.1666615754365921, -0.148834228515625, 0, 0]
    ];

  /**
   * Form, where results will be submitted.
   */
  $form = createForm(config.target.uri, config.target.method, $.extend({
    startTime: null,
    endTime: null
  }, config.state));
  $('body').append($form);

  $play = $('#btn-play');
  $pause = $('#btn-pause');
  $stop = $('#btn-stop');
  $save = $('#btn-save');

  /**
   * Info about song and selected region.
   */
  $songLength = $('#song-length');
  $regionLength = $('#region-length');

    /**
   * Adds 'active' class to $pause button.
   */
  togglePlaying = function () {
    $play.addClass('disabled');
    $pause.removeClass('disabled');
  };

  /**
   * Adds 'active' class to $play button.
   */
  togglePaused = function () {
    $play.removeClass('disabled');
    $pause.addClass('disabled');
  };

  /**
   * ==========================================
   * Setup WaveSurfer
   * ==========================================
   */

  wavesurfer = WaveSurfer.create($.extend({
    splitChannels: true,
    interact: false,
    scrollParent: false,
    fillParent: true,
    hideScrollbar: true,
    backend: 'MediaElement',
    forceDecode: true
  }, config.player));

  wavesurfer.on('ready', function () {
    var duration, initialStart, initialEnd, adjustRegionLength, resetCurrentPosition, region;

    /**
     * Song duration in seconds.
     */
    duration = wavesurfer.getDuration();

    $songLength.text(round(duration) + ' sec');

    /**
     * Initial region start in seconds.
     */
    initialStart = config.state.startTime || 0;

    /**
     * Initial region end in seconds.
     */
    initialEnd = Math.min(config.state.endTime || maxLength, duration);

    $regionLength.text(getRegionLengthText(initialStart, initialEnd));

    /**
     * Adjusts the length of region
     * to be less than max allowed length.
     */
    adjustRegionLength = function () {
      var end, updatedEnd;
      end = Math.min(region.start + maxLength, duration);
      updatedEnd = Math.min(end, region.end);
      if(end < region.end) {
        region.update({ end: end });
      }
      return updatedEnd;
    };

    /**
     * Resets current position of the player to
     * start of region.
     */
    resetCurrentPosition = function (shouldStop) {
      if (shouldStop && wavesurfer.isPlaying()) {
        wavesurfer.stop();
      }
      wavesurfer.seekTo(region.start / duration);
    };

    /**
     * ==========================================
     * Setup WaveSurfer region
     * ==========================================
     */

    region = wavesurfer.addRegion($.extend({
      start: initialStart,
      end: initialEnd,
      loop: true,
      drag: true,
      resize: true
    }, config.region));

    region.on('update-end', function () {
      var end = adjustRegionLength();
      resetCurrentPosition(end < wavesurfer.getCurrentTime());
      $regionLength.text(getRegionLengthText(region.start, region.end));
    });

    $play.on('click', function () {
      togglePlaying();
      wavesurfer.play();
    });

    $pause.on('click', function () {
      togglePaused();
      wavesurfer.pause();
    });

    $stop.on('click', function () {
      togglePaused();
      resetCurrentPosition(true);
    });

    $save.on('click', function () {
      $form.find('input[name="startTime"]').val(region.start);
      $form.find('input[name="endTime"]').val(region.end);
      $form.submit();
    });

    var prevWidth = 0;
    window.addEventListener('resize',
      WaveSurfer.util.debounce(function () {
        if (prevWidth != wavesurfer.drawer.wrapper.clientWidth) {
          prevWidth = wavesurfer.drawer.wrapper.clientWidth;
          wavesurfer.empty();
          wavesurfer.drawBuffer();
          region.updateRender();
        }
      }, 100),
    true);
  });

  wavesurfer.load(config.file, initialPeaks, 'auto');
});
