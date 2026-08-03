function showToast(msg) {
      const stack = document.getElementById('toastStack');
      const el = document.createElement('div');
      el.className = 'toast'; el.textContent = msg;
      stack.appendChild(el);
      requestAnimationFrame(() => el.classList.add('show'));
      setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 250); }, 2600);
    }
