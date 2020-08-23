import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'

export default {
  preview(img){
    let viewer = new Viewer(img, {
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

      hidden: function(){
        viewer.destroy();
      }
    });

    viewer.show();
    return viewer;
  }
}


