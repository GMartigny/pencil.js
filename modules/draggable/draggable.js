import Component from "@pencil.js/component";
import MouseEvent from "@pencil.js/mouse-event";
import { constrain } from "@pencil.js/math";

/**
 * @typedef {Object} DraggableOptions
 * @prop {Boolean} [x=true] - Can move along vertical axis
 * @prop {Boolean} [y=true] - Can move along horizontal axis
 * @prop {Vector} [constrain] - Relative limit of freedom (if set, will ignore x and y options)
 */

/**
 * @typedef {Object} DraggableAPI
 * @prop {Function} x - Change the "x" value in the draggable's options
 * @prop {Function} y - Change the "y" value in the draggable's options
 * @prop {Function} constrain - Change the "constrain" value in the draggable's options
 */

/**
 * Set this component draggable
 * @param {DraggableOptions} options - Additional options
 * @return {DraggableAPI}
 */
Component.prototype.draggable = function draggable (options) {
    const cursorNotSet = !this.options.cursor;
    if (cursorNotSet) {
        this.options.cursor = "-webkit-grab";
    }
    this.isDraggable = true;
    const mergedOptions = Object.assign({
        x: true,
        y: true,
    }, options);

    let startPosition = null;
    let originPosition = null;
    this.on("mousedown", (event) => {
        if (cursorNotSet) {
            this.options.cursor = "-webkit-grabbing";
        }
        startPosition = event.position;
        originPosition = this.position.clone();
        this.isDragged = true;

        this.fire(new MouseEvent(this, "grab", event.position));
    }, true);

    this.getScene().then(scene => scene.on("mousemove", (event) => {
        if (this.isDragged && startPosition) {
            const difference = event.position.subtract(startPosition);

            if (mergedOptions.constrain) {
                const limit = mergedOptions.constrain;
                this.position.set(originPosition.add(
                    constrain(difference.x, limit.start.x, limit.end.x),
                    constrain(difference.y, limit.start.y, limit.end.y),
                ));
            }
            else {
                this.position.set(originPosition.add(mergedOptions.x && difference.x, mergedOptions.y && difference.y));
            }

            this.fire(new MouseEvent(this, "drag", event.position));
        }
    }).on("mouseup", (event) => {
        if (cursorNotSet) {
            this.options.cursor = "-webkit-grab";
        }
        this.isDragged = false;
        startPosition = null;

        this.fire(new MouseEvent(this, "drop", event.position));
    }));

    return {
        /**
         * Set the draggable "x" option
         * @param {Boolean} x - New value for "x"
         */
        set x (x) {
            mergedOptions.x = x;
        },

        /**
         * Set the draggable "y" option
         * @param {Boolean} y - New value for "y"
         */
        set y (y) {
            mergedOptions.y = y;
        },

        /**
         * Set the draggable "constrain" option
         * @param {Vector} constrain - New value for "constrain"
         */
        set constrain (constrain) {
            mergedOptions.constrain = constrain;
        },
    };
};
