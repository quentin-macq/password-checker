const getState = () => {
    return new Promise((resolve, reject) => {
        browser.runtime.sendMessage(
            {cmd: "getState"},
            response => {
                if (response) {
                    resolve(response.state)
                } else {
                    reject('Cannot resolve status');
                }
            }
        )
    })
}

const checkPasswordStrength = password => {
    const mediumRegex = (/(?=.*\d)(?=.*[!@#$%^&*]{0,})(?=.*[a-z])(?=.*[A-Z]).{10,}/gu);
    const strongRegex = (/(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{14,}/gu);

    if (password.length >= 14 && strongRegex.test(password)) {
        return 'strong';
    } else if (password.length >= 10 && mediumRegex.test(password)) {
        return 'good';
    } else {
        return 'weak';
    }
}

const inputKeyUpEventHandler = async (i, c, b) => {
    // If password check is on...
    if (await getState() === true) {
        // ...and the input has not a null value
        if ((i.value && !i.hasAttribute('defaultValue')) || (i.value && i.hasAttribute('defaultValue') && (i.value !== i.defaultValue))) {
            const strength = checkPasswordStrength(i.value);
            const balloon_text = b.querySelector('.password-checker__balloon-text');
            let strengthText;

            c.style.visibility = 'visible';
            c.className = `password-checker__icon ${strength}`;

            if (strength === 'strong') {
                strengthText = 'Appelez Chuck Norris !';
            } else if (strength === 'good') {
                strengthText = 'Ton mot de passe est correct... pour le moment';
            } else {
                strengthText = 'C\'est quoi ce mot de passe ?!';
            }

            // Append a new text message to the balloon
            balloon_text.innerHTML = '';
            balloon_text.appendChild(document.createTextNode(strengthText));
        } else {
            c.style.visibility = 'hidden';
            b.style.display = 'none';
            c.className = `password-checker__icon`;
        }
    }
}

const iconClickEventHandler = b => {
    if (window.getComputedStyle(b).display === 'none') {
        b.style.display = 'block'
    } else {
        b.style.display = 'none'
    }
}

const destroyContainers = () => {
    const containers = document.getElementsByClassName('password-checker')

    while (containers.length > 0) {
        containers[0].parentNode.removeChild(containers[0]);
    }
}

const constructContainers = () => {
    const inputs = document.getElementsByTagName("input")

    // For each input...
    for (let o = 0; o < inputs.length; o++) {
        // ...of `password` type
        if (inputs[o].type.toLowerCase() === "password") {
            const i = inputs[o]
            const ipos = i.getBoundingClientRect()
            const pc = document.createElement('div')
            const pc_icon = document.createElement('div')
            const pc_balloon = document.createElement('div')
            const pc_balloon_arrow = document.createElement('div')
            const pc_balloon_text = document.createElement('div')

            //// Create a container

            // Create an icon
            pc.className = `password-checker`
            pc_icon.className = `password-checker__icon`
            pc_icon.style.cssText = (`
				top: calc(3px + ${window.getComputedStyle(i).getPropertyValue('margin-top')}) !important;
				right: 3px !important;
				height: calc(${ipos.bottom}px - ${ipos.top}px - 6px) !important;
			`)
            i.parentNode.insertBefore(pc, i)
            pc.appendChild(pc_icon)

            // Create a balloon
            pc_balloon.className = 'password-checker__balloon'
            pc_balloon_arrow.className = 'password-checker__balloon-arrow'
            pc_balloon_text.className = 'password-checker__balloon-text'
            pc_balloon_arrow.style.cssText = (`
				top: calc(${ipos.bottom}px - ${ipos.top}px + 3px) !important;
				right: -2px !important;
			`)
            pc_balloon_text.style.cssText = (`
				top: calc(${ipos.bottom}px - ${ipos.top}px + 13px) !important;
				right: -10px !important;
			`)
            pc_balloon.appendChild(pc_balloon_arrow)
            pc_balloon.appendChild(pc_balloon_text)
            pc.appendChild(pc_balloon)

            // Initial set up of the container -- in case the input has a not null value
            inputKeyUpEventHandler(i, pc_icon, pc_balloon)

            // Set up event handlers
            i.addEventListener('keyup', inputKeyUpEventHandler.bind(null, i, pc_icon, pc_balloon))
            pc_icon.addEventListener('click', iconClickEventHandler.bind(null, pc_balloon))
        }
    }
}

browser.runtime.onMessage.addListener(
    (request) => {
        if (request.cmd === 'setState') {
            request.state ? constructContainers() : destroyContainers();
        }
    }
)

window.onload = async () => {
    // If password check is on -- initialize containers
    if (await getState() === true) {
        constructContainers()
    }
}