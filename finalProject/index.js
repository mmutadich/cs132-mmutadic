(function (){
    "use strict";
    
    function init () {
        const cowNav = qs("#cow-sectioned");
        cowNav.addEventListener('click', () => {
            toggleSection(qs("#dairy"));
        });
        const bundle = qs("#bundle-icon");
        bundle.addEventListener('click', () => {
            toggleSection(qs("#bundle"))
        });
        let selectedOpt = qsa(".bundle-option select");
        selectedOpt.forEach( option => {
            option.addEventListener('click', displayImg);
        });
        // TODO: change select, change image
        // TODO: select different parts of cow image give different sections

    }

    function toggleSection(section) {
        const otherSections = qsa('main > section');
        otherSections.forEach( sect => {
            if (sect.classList.contains('hidden') ==  false){
                sect.classList.add('hidden');
            }
        })
        section.classList.remove('hidden');
    }

    init();
    }
)();