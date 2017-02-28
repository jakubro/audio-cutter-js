$(document).ready(function () {
  var config = _songcut_config;

  var $form = createForm('body', config.target.uri, config.target.method, config.source.metadata);
  var waveSurfer = createWaveSurfer('#waveform', config.source.uri);

  $('#btn-play').on('click', function () {
    waveSurfer.playPause();
  });
  $('#btn-save').on('click', function () {
    $form.submit();
  });
});

function createForm(rootElement, action, method, inputArr) {
  var $form = $('<form></form>');
  $form.attr('action', action);
  $form.attr('method', method);
  for (var name in inputArr) {
    if (inputArr.hasOwnProperty(name)) {
      var $input = $('<input type="hidden">');
      $input.attr('name', name);
      $input.attr('value', inputArr[name]);
      $form.append($input);
    }
  }
  $(rootElement).append($form);
  return $form;
}

function createWaveSurfer(rootElement, songUri) {
  var waveSurfer = WaveSurfer.create({
    container: rootElement,
    splitChannels: true
  });
  waveSurfer.load(songUri);
  waveSurfer.on('ready', function () {
  });
  return waveSurfer;
}
