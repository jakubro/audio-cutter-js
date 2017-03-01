$(document).ready(function () {
  var config = _songcut_config;

  var $form = $('<form></form>');
  $form.attr('action', config.target.uri);
  $form.attr('method', config.target.method);
  for (var name in config.source.metadata) {
    if (config.source.metadata.hasOwnProperty(name)) {
      var $input = $('<input type="hidden">');
      $input.attr('name', name);
      $input.attr('value', config.source.metadata[name]);
      $form.append($input);
    }
  }
  $('body').append($form);

  var wavesurfer = WaveSurfer.create({
    container: config.player.element,
    splitChannels: true,
    interact: false,
    scrollParent: false,
    cursorColor: '#c63ab2',
    progressColor: '#4BB9F7',
    waveColor: '#7e7e7e'
  });

  wavesurfer.load(config.source.uri);
  wavesurfer.on('ready', function () {

    var region = wavesurfer.addRegion({
      start: 0,
      end: Math.min(30, wavesurfer.getDuration()),
      loop: true,
      drag: true,
      resize: true,
      color: 'hsla(330, 100%, 20%, 0.2)'
    });

    region.on('update-end', function () {
      // update length of region to allowed max
      region.update({
        end: Math.min(region.start + 30, region.end)
      });
      // reset position to start of region
      if(wavesurfer.isPlaying() && region.end < wavesurfer.getCurrentTime()) {
        wavesurfer.stop();
      }
      wavesurfer.seekTo(region.start / wavesurfer.getDuration());
    });

    $('#btn-play').on('click', function () {
      wavesurfer.play();
    });

    $('#btn-pause').on('click', function () {
      wavesurfer.pause();
    });

    $('#btn-stop').on('click', function () {
      // reset position to start of region
      wavesurfer.stop();
      wavesurfer.seekTo(region.start / wavesurfer.getDuration());
    });

    $('#btn-save').on('click', function () {
      $form.find('input[name="startTime"]').val(region.start);
      $form.find('input[name="endTime"]').val(region.end);
      // $form.submit();
    });
  });
});
