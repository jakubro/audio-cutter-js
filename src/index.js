$(document).ready(function () {
  'use strict';

  var createForm, config, maxLength, $form, $play, $pause, $stop, $save, togglePlaying, togglePaused, wavesurfer;

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

  /**
   * Configuration.
   */
  config = _songcut_config || {};

  /**
   * Max length of region in seconds.
   */
  maxLength = config.maxLength || 30;

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
   * Adds 'active' class to $play button.
   */
  togglePlaying = function () {
    $play.addClass('active');
    $pause.removeClass('active');
  };

  /**
   * Adds 'active' class to $pause button.
   */
  togglePaused = function () {
    $play.removeClass('active');
    $pause.addClass('active');
  };

  /**
   * ==========================================
   * Setup WaveSurfer
   * ==========================================
   */

  wavesurfer = WaveSurfer.create($.extend({
    splitChannels: true,
    interact: false,
    scrollParent: false
  }, config.player));

  wavesurfer.on('ready', function () {
    var duration, initialStart, initialEnd, adjustRegionLength, resetCurrentPosition, region;

    /**
     * Song duration in seconds.
     */
    duration = wavesurfer.getDuration();

    /**
     * Initial region start in seconds.
     */
    initialStart = config.state.startTime || 0;

    /**
     * Initial region end in seconds.
     */
    initialEnd = Math.min(config.state.endTime || maxLength, duration);

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
  });

  wavesurfer.load(config.file);
});
