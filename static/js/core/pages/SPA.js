console.log(`inner height: ${window.innerHeight}`)

document.addEventListener('scroll', function() {
    var scrollElement = document.getElementById('scrollElement');
    var threshold_panel1 = window.innerHeight ; // Adjust as needed
    var threshold_panel2 = window.innerHeight * 2; // Adjust as needed

    console.log(`current scroll: ${window.scrollY}`)
    if (window.scrollY < threshold_panel1) {
        scrollElement.style.left = '100%';
    } else if (window.scrollY > threshold_panel1 && window.scrollY < threshold_panel2) {
        scrollElement.style.left = '0%';
    } else if (window.scrollY > threshold_panel2) {
        scrollElement.style.left = '-100%';
    }
});