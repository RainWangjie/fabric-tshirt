/**
 * Created by gewangjie on 2017/9/19
 */
(function (global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {}),
        extend = fabric.util.object.extend;

    /**
     * Mask filter class
     * See http://resources.aleph-1.com/mask/
     * @class fabric.Image.filters.Mask
     * @memberOf fabric.Image.filters
     * @extends fabric.Image.filters.BaseFilter
     * @see {@link fabric.Image.filters.Mask#initialize} for constructor definition
     */
    fabric.Image.filters.MaskUp = fabric.util.createClass(fabric.Image.filters.BaseFilter, /** @lends fabric.Image.filters.Mask.prototype */ {

        /**
         * Filter type
         * @param {String} type
         * @default
         */
        type: 'MaskUp',
        /**
         * Constructor
         * @memberOf fabric.Image.filters.Mask.prototype
         * @param {Object} [options] Options object
         * @param {fabric.Image} [options.mask] Mask image object
         * @param {Number} [options.channel=0] Rgb channel (0, 1, 2 or 3)
         */
        initialize: function (options) {
            options = options || {};
            this.mask = options.mask;
            this.channel = [0, 1, 2, 3].indexOf(options.channel) > -1 ? options.channel : 0;
        },

        /**
         * Applies filter to canvas element
         * @param {Object} canvasEl Canvas element to apply filter to
         */
        applyTo: function (canvasEl) {
            if (!this.mask) {
                return;
            }

            var context = canvasEl.getContext('2d'),
                imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
                data = imageData.data,
                maskEl = this.mask.getElement(),
                maskCanvasEl = fabric.util.createCanvasElement(),
                maskImgCtx = maskCanvasEl.getContext('2d'),
                i;

            var imgObject = canvas.getActiveObject();

            //console.log(imgObject);

            maskCanvasEl.width = canvasEl.width;
            maskCanvasEl.height = canvasEl.height;
            //maskCanvas.width = canvasEl.width;
            //maskCanvas.height = canvasEl.height;

            var x = print.x - imgObject.left,
                y = print.y - imgObject.top;

            maskImgCtx.translate(maskCanvasEl.width / 2, maskCanvasEl.height / 2);
            maskImgCtx.rotate(-1 * imgObject.angle * (Math.PI / 180));
            maskImgCtx.scale(1 / imgObject.scaleX, 1 / imgObject.scaleY);
            maskImgCtx.drawImage(maskEl, x, y, print.w, print.h);

            /*
             辅助画布
             */
            //maskCtx.translate(canvasEl.width / 2, canvasEl.height / 2);
            //maskCtx.rotate(-1 * imgObject.angle * (Math.PI / 180));
            //maskCtx.scale(1 / imgObject.scaleX, 1 / imgObject.scaleY);
            //maskCtx.drawImage(maskEl, x, y, print.w, print.h);
            //
            //maskCtx.beginPath();
            //maskCtx.rect(x, y, print.w, print.h);
            //maskCtx.closePath();
            //maskCtx.strokeStyle = '#f00';
            //maskCtx.stroke();
            var maskImageData = maskImgCtx.getImageData(0, 0, maskCanvasEl.width, maskCanvasEl.height),
                maskData = maskImageData.data;

            for (i = 0; i < maskData.length; i += 4) {
                if (maskData[i + 3] == 0) {
                    data[i + 3] = 0;
                }
            }
            context.putImageData(imageData, 0, 0);
        },

        /**
         * Returns object representation of an instance
         * @return {Object} Object representation of an instance
         */
        toObject: function () {
            return extend(this.callSuper('toObject'), {
                mask: this.mask.toObject(),
                channel: this.channel
            });
        }
    });

    /**
     * Returns filter instance from an object representation
     * @static
     * @param {Object} object Object to create an instance from
     * @param {Function} [callback] Callback to invoke when a mask filter instance is created
     */
    fabric.Image.filters.MaskUp.fromObject = function (object, callback) {
        fabric.util.loadImage(object.mask.src, function (img) {
            object.mask = new fabric.Image(img, object.mask);
            callback && callback(new fabric.Image.filters.MaskUp(object));
        });
    };

    /**
     * Indicates that instances of this type are async
     * @static
     * @type Boolean
     * @default
     */
    fabric.Image.filters.MaskUp.async = true;

})(typeof exports !== 'undefined' ? exports : this);