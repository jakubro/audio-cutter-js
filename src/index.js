$(document).ready(function () {
  var config, wavesurfer, $form, $play, $pause, $stop, $save;

  config = _songcut_config;

  $form = createForm(config.target.uri, config.target.method, config.source.metadata);
  $('body').append($form);

  $play = $('#btn-play');
  $pause = $('#btn-pause');
  $stop = $('#btn-stop');
  $save = $('#btn-save');

  wavesurfer = WaveSurfer.create($.extend({
    splitChannels: true,
    interact: false,
    scrollParent: false
  }, config.player));

  wavesurfer.on('ready', function () {
    var duration, startTime, endTime, region;

    duration = wavesurfer.getDuration();
    startTime = config.source.metadata.startTime || 0;
    endTime = Math.min(config.source.metadata.startTime || 30, duration);

    region = wavesurfer.addRegion($.extend({
      start: startTime,
      end: endTime,
      loop: true,
      drag: true,
      resize: true,
    }, config.region));
    region.on('update-end', function () {
      // update length of region to allowed max
      region.update({
        end: Math.min(region.start + 30, region.end)
      });
      // reset position to start of region
      if(wavesurfer.isPlaying() && region.end < wavesurfer.getCurrentTime()) {
        wavesurfer.stop();
      }
      wavesurfer.seekTo(region.start / duration);
    });

    $play.on('click', function () {
      $play.removeClass('active');
      $pause.addClass('active');
      wavesurfer.play();
    });

    $pause.on('click', function () {
      $play.addClass('active');
      $pause.removeClass('active');
      wavesurfer.pause();
    });

    $stop.on('click', function () {
      $play.addClass('active');
      $pause.removeClass('active');
      // reset position to start of region
      wavesurfer.stop();
      wavesurfer.seekTo(region.start / duration);
    });

    $save.on('click', function () {
      $form.find('input[name="startTime"]').val(region.start);
      $form.find('input[name="endTime"]').val(region.end);
      $form.submit();
    });
  });

  wavesurfer.load(config.source.uri);
});

function createForm(action, method, inputs) {
  var $form, name, $input;
  $form = $('<form></form>');
  $form.attr('action', action);
  $form.attr('method', method);
  for (name in inputs) {
    if (inputs.hasOwnProperty(name)) {
      $input = $('<input type="hidden">');
      $input.attr('name', name);
      $input.attr('value', inputs[name]);
      $form.append($input);
    }
  }
  return $form;
}
