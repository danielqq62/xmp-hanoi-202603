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
  const viewerWrap = document.querySelector('.viewer-wrap');
  const indicator = document.getElementById('slideIndicator');
  const statusText = document.getElementById('statusText');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const baseWidth = 1280;
  const baseHeight = 720;
  const supportsFullscreen = Boolean(presentationShell.requestFullscreen);
  presentationShell.setAttribute('tabindex', '0');

  const updateUI = () => {
    frame.classList.add('is-loading');
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

  const handleKeydown = (event) => {
    if (event.defaultPrevented) {
      return;
    }
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
      if (supportsFullscreen) {
        if (!document.fullscreenElement) {
          toggleFullscreen();
        }
      } else {
        toggleFullscreen();
      }
    }
  };

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
  document.addEventListener('keydown', handleKeydown);

  if (viewerWrap) {
    viewerWrap.addEventListener('click', (event) => {
      presentationShell.focus({ preventScroll: true });
      if (event.target.closest('button, a')) {
        return;
      }
      const rect = viewerWrap.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      if (clickX < rect.width / 2) {
        goTo(currentIndex - 1);
      } else {
        goTo(currentIndex + 1);
      }
    });
  }

  const applySlideAnimations = () => {
    const doc = frame.contentDocument;
    if (!doc) {
      return;
    }

    let styleTag = doc.getElementById('slide-reveal-style');
    if (!styleTag) {
      styleTag = doc.createElement('style');
      styleTag.id = 'slide-reveal-style';
      styleTag.textContent = `
        @keyframes revealUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes softFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        .reveal-in {
          opacity: 0;
          animation: revealUp 700ms ease forwards;
        }
        .floaty {
          animation: softFloat 6s ease-in-out infinite;
        }
        .hover-lift {
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .hover-lift:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 32px rgba(0, 0, 0, 0.35);
        }
      `;
      doc.head.appendChild(styleTag);
    }

    const elements = Array.from(
      doc.querySelectorAll(
        'h1, h2, h3, p, li, .feature-card, .feature-item, .card, .stat-card, .kpi-card, .summary-card, .speaker-card, .comparison-bar, .content-wrapper > *'
      )
    );

    const seen = new Set();
    const ordered = elements.filter((el) => {
      if (seen.has(el)) return false;
      seen.add(el);
      return true;
    });

    ordered.forEach((el, index) => {
      el.classList.add('reveal-in');
      el.style.animationDelay = `${Math.min(index * 70, 900)}ms`;
    });

    doc.querySelectorAll('.feature-card, .speaker-card, .comparison-bar').forEach((el) => {
      el.classList.add('hover-lift');
    });

    doc.querySelectorAll('.glow-cyan, .glow-pink, .glow-blue, .orb-top-right, .orb-bottom-left').forEach((el) => {
      el.classList.add('floaty');
    });
  };

  frame.addEventListener('load', () => {
    statusText.textContent = `Loaded: ${slidePaths[currentIndex]}`;
    frame.classList.remove('is-loading');
    applySlideAnimations();
    if (frame.contentWindow) {
      frame.contentWindow.addEventListener('keydown', handleKeydown);
    }
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
    const isImmersive = presentationShell.classList.contains('is-immersive');
    const isActive = supportsFullscreen ? isFullscreen : isImmersive;
    fullscreenBtn.textContent = isActive ? 'Exit Fullscreen' : 'Fullscreen';
  };

  const toggleFullscreen = () => {
    if (!supportsFullscreen) {
      presentationShell.classList.toggle('is-immersive');
      updateFullscreenLabel();
      updateScale();
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
    presentationShell.focus({ preventScroll: true });
  });

  if (!supportsFullscreen) {
    statusText.textContent = 'Fullscreen not supported on this device. Using immersive mode.';
  }

  window.addEventListener('resize', updateScale);
  window.addEventListener('orientationchange', updateScale);
  window.addEventListener('focus', () => {
    presentationShell.focus({ preventScroll: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      presentationShell.focus({ preventScroll: true });
    }
  });

  updateUI();
  updateFullscreenLabel();
  updateScale();
})();
