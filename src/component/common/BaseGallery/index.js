/** @see https://github.com/fengyuanchen/viewerjs */
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css';

function preview(element){
  let viewer = null;
  var options = {
    navbar: false,
    fullscreen: false,
    toolbar: {
      zoomIn: true,
      zoomOut: true,
      oneToOne:true,
      reset: true,
      rotateLeft: true,
      rotateRight: true,
      flipHorizontal: true,
      flipVertical: true
    },
    url: 'data-origin',
    hidden(){
      viewer && viewer.destroy();
    }
  };

  viewer = new Viewer(element, options);
  viewer.show();

  return viewer;
}

const BaseGallery = {preview};
export default BaseGallery;