$(document).ready(function () {
  var config, wavesurfer, $form, $play, $pause, $stop, $save;

  config = _songcut_config;

  $form = createForm(config.target.uri, config.target.method, $.extend({
    startTime: null,
    endTime: null
  }, config.state));
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
    var region;

    region = wavesurfer.addRegion($.extend({
      start: config.state.startTime || 0,
      end: Math.min(config.state.endTime || config.maxLength || 30, wavesurfer.getDuration()),
      loop: true,
      drag: true,
      resize: true,
    }, config.region));

    region.on('update-end', function () {
      region.update({
        end: Math.min(region.start + config.maxLength || 30, region.end)
      });
      if (wavesurfer.isPlaying() && region.end < wavesurfer.getCurrentTime()) {
        wavesurfer.stop();
      }
      wavesurfer.seekTo(region.start / wavesurfer.getDuration());
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

      wavesurfer.stop();
      wavesurfer.seekTo(region.start / wavesurfer.getDuration());
    });

    $save.on('click', function () {
      $form.find('input[name="startTime"]').val(region.start);
      $form.find('input[name="endTime"]').val(region.end);

      $form.submit();
    });
  });

  wavesurfer.load(config.file);
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
      $input.attr('value', inputs[name] || '');
      $form.append($input);
    }
  }
  return $form;
}
