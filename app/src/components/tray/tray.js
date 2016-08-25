import path from 'path';
import {Tray, screen, BrowserWindow, globalShortcut} from 'electron';

function initTray(mainWindow, options) {
    let tray = new Tray(path.join(__dirname, options.systemTray.icon));

    mainWindow.on('show', () => {
        tray.setHighlightMode('never')
    });
    mainWindow.on('hide', () => {
        tray.setHighlightMode('never')
    });

    const showOrHide = function () {

        if (!options.systemTray.popup) {
            mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
            return;
        }

        if (mainWindow.isVisible()) {
            mainWindow.hide();
            return;
        }

        const trayBounds = tray.getBounds();

        const cursorPosition = { x: trayBounds.x + trayBounds.width/2, y: trayBounds.y + trayBounds.height/2}
        const primarySize = screen.getPrimaryDisplay().workAreaSize; // Todo: this uses primary screen, it should use current
        const trayPositionVert = cursorPosition.y >= primarySize.height/2 ? 'bottom' : 'top';
        const trayPositionHoriz = cursorPosition.x >= primarySize.width/2 ? 'right' : 'left';
        mainWindow.setPosition(getTrayPosX(),  getTrayPosY());
        mainWindow.show();
        mainWindow.focus();

        ///////////////////////

        function getTrayPosX(){
            // Find the horizontal bounds if the window were positioned normally
            let width = mainWindow.getSize()[0];

            const horizBounds = {
                left:   cursorPosition.x - width/2,
                right:  cursorPosition.x + width/2
            };
            // If the window crashes into the side of the screem, reposition
            if(trayPositionHoriz == 'left'){
                return horizBounds.left <= options.systemTray.popup.padding_horizontal ?
                    options.systemTray.popup.padding_horizontal : horizBounds.left;
            }

            else{
                return horizBounds.right >= primarySize.width ?
                primarySize.width - options.systemTray.popup.padding_horizontal - width:
                horizBounds.right - width;
            }
        }
        function getTrayPosY(){
            let height = mainWindow.getSize()[1];

            return trayPositionVert == 'bottom' ?
            cursorPosition.y - height - options.systemTray.popup.padding_vertical :
            cursorPosition.y + options.systemTray.popup.padding_vertical;
        }
    };

    if (options.systemTray.popup) {

        // mainWindow.setSize(options.systemTray.popup.window_width, options.systemTray.popup.window_height);
        // mainWindow.setResizable(false);

        mainWindow.on('close', function () {
            mainWindow = null;
        });
        mainWindow.on('blur', function() {
            mainWindow.hide();
        });


        tray.on('click', (event) => {
            showOrHide();
        });
    } else {
        tray.on('click', () => {
            showOrHide();
        });
    }

    globalShortcut.register('Command+Shift+V', () => {
        showOrHide();
    });

}

export default initTray;
