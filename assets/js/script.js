(() => {
  const totalSlides = 17;
  const slidePaths = Array.from({ length: totalSlides }, (_, i) => {
    const slideNumber = i + 1;
    return `slides/slide${slideNumber}.html`;
  });

  let currentIndex = 0;

  const frame = document.getElementById('slideFrame');
  const presentationShell = document.getElementById('presentationShell');
  const slideStage = document.querySelector('.slide-stage');
  const slideWrap = document.querySelector('.slide-frame-wrap');
  const indicator = document.getElementById('slideIndicator');
  const statusText = document.getElementById('statusText');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const baseWidth = 1280;
  const baseHeight = 720;

  const updateUI = () => {
    frame.src = slidePaths[currentIndex];
    indicator.textContent = `Slide ${currentIndex + 1} / ${totalSlides}`;
  };

  const goTo = (index) => {
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    updateUI();
  };

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(currentIndex - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(currentIndex + 1);
    }

    if (event.key === 'f' || event.key === 'F') {
      event.preventDefault();
      if (!document.fullscreenElement) {
        toggleFullscreen();
      }
    }
  });

  frame.addEventListener('load', () => {
    statusText.textContent = `Loaded: ${slidePaths[currentIndex]}`;
  });

  frame.addEventListener('error', () => {
    statusText.textContent = `Cannot load ${slidePaths[currentIndex]} (file missing).`;
  });

  const updateScale = () => {
    if (!slideStage || !slideWrap) {
      return;
    }
    const availableWidth = slideStage.clientWidth;
    const availableHeight = slideStage.clientHeight;
    if (!availableWidth || !availableHeight) {
      return;
    }
    const widthRatio = availableWidth / baseWidth;
    const heightRatio = availableHeight / baseHeight;
    const scale = Math.min(widthRatio, heightRatio);
    slideWrap.style.setProperty('--slide-scale', scale.toString());
  };

  const updateFullscreenLabel = () => {
    const isFullscreen = document.fullscreenElement === presentationShell;
    fullscreenBtn.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
  };

  const toggleFullscreen = () => {
    if (!presentationShell.requestFullscreen) {
      statusText.textContent = 'Fullscreen is not supported in this browser.';
      return;
    }

    if (!document.fullscreenElement) {
      presentationShell.requestFullscreen();
    }
  };

  fullscreenBtn.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', () => {
    updateFullscreenLabel();
    updateScale();
  });

  if (!presentationShell.requestFullscreen) {
    fullscreenBtn.disabled = true;
    fullscreenBtn.textContent = 'Fullscreen N/A';
  }

  window.addEventListener('resize', updateScale);

  updateUI();
  updateFullscreenLabel();
  updateScale();
})();
