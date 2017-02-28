$(document).ready(function () {
  var config = _songcut_config;

  var $form = createForm(config.target.uri, config.target.method, config.source.metadata);
  $('body').append($form);

  setupWaveSurfer('#waveform');

  $('#btn-play').on('click', function () {
    wavesurfer.playPause();
  });
  $('#btn-save').on('click', function () {
    $form.submit();
  });
});

function createForm(action, method, inputArr) {
  var $form = $('<form></form>');
  $form.attr('action', action);
  $form.attr('method', method);
  for(var name in inputArr) {
    if(inputArr.hasOwnProperty(name)) {
      var $input = $('<input type="text">');
      $input.attr('name', name);
      $input.attr('value', inputArr[name]);
      $form.append($input);
    }
  }
  return $form;
}

function setupWaveSurfer(rootElement) {
  var wavesurfer = WaveSurfer.create({
    container: rootElement,
    splitChannels: true
  });

  wavesurfer.load(config.source.songuri);
  wavesurfer.on('ready', function () {
  });
}
