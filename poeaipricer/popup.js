
document.addEventListener('DOMContentLoaded', function () {

  const popupOverlay = document.getElementById('popup-overlay');
  const closePopup = document.getElementById('close-popup');
  const infoButton = document.getElementById('info-button');

  function openPopup() {

      popupOverlay.style.display = 'block';

  }
  function closePopupFunc() {

      popupOverlay.style.display = 'none';

  }

  infoButton.addEventListener('click',function() {
    openPopup();
  });
  
  closePopup.addEventListener('click', closePopupFunc);

  popupOverlay.addEventListener('click', function (event) {

      if (event.target === popupOverlay) {

          closePopupFunc();

      }

  });
});

