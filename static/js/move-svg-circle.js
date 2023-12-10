document.addEventListener('DOMContentLoaded', function() {
    var homeSection = document.getElementById('home');
    window.scrollTo({
        top: homeSection.offsetTop,
        behavior: 'smooth'
    });

    var powerCircle = document.querySelector('#control-panel-svg circle');
    powerCircle.addEventListener('click', function() {
        var currentY = parseFloat(powerCircle.getAttribute('cy'));
        var newY = (currentY === 147.54) ? 54.54 : 147.54;
        
        powerCircle.setAttribute('cy', newY.toString());
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

