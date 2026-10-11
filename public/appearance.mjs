// Native details/links remain usable if this enhancement does not load.
document.querySelectorAll('.appearance-picker').forEach(picker => {
  const trigger = picker.querySelector('summary');
  document.addEventListener('click', event => {
    if (picker.open && !picker.contains(event.target)) picker.open = false;
  });
  picker.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !picker.open) return;
    picker.open = false;
    trigger.focus();
    event.preventDefault();
  });
});
