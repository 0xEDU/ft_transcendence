console.log(`inner height: ${window.innerHeight}`)

document.addEventListener('scroll', function() {
    var firstPane = document.getElementById('first-pane');
    var secondPane = document.getElementById('second-pane');
    // var lastPane = document.getElementById('last-pane');

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    var thresholdOne = window.innerHeight;
    // var thresholdTwo = window.innerHeight * 2;

    console.log(`current scroll: ${window.scrollY}`)
    if (window.scrollY <= thresholdOne) {
        secondPane.style.left = 0 + 'px';
        secondPane.style.top = viewportHeight + 'px';
    } else if (window.scrollY > thresholdOne) {
        secondPane.style.left = ((((2 * viewportHeight - window.scrollY) / viewportHeight) - 1) * 100) + '%';
        secondPane.style.top = window.scrollY + 'px';
        console.log(`calculated top: ${calculated_top}`)
    }
});