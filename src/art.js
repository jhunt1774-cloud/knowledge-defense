/* Shared illustrated art loader. assets-bundle.js contains optimized local WebP
 * data URLs so the same build works on GitHub Pages and directly from a folder. */
window.KDArt={
  preload(scene){
    const data=window.KD_ASSETS;
    if(!data)throw Error('The illustrated asset bundle is missing.');
    const x=scene.scale.width/2,y=scene.scale.height/2;
    const label=scene.add.text(x,y-20,'SUMMONING THE KINGDOM…',{fontFamily:'Georgia',fontSize:'20px',color:'#ebc77f'}).setOrigin(.5);
    const track=scene.add.rectangle(x,y+20,280,4,0x34554a),bar=scene.add.rectangle(x-140,y+20,0,4,0xebc77f).setOrigin(0,.5);
    scene.load.on('progress',p=>bar.width=280*p);
    scene.load.once('complete',()=>{label.destroy();track.destroy();bar.destroy();});
    for(const [key,asset] of Object.entries(data))scene.load.image(key,asset.data);
  },
  register(scene){
    for(const [key,asset] of Object.entries(window.KD_ASSETS)){
      const texture=scene.textures.get(key);
      for(const [i,rect]of (asset.frames||[]).entries())texture.add(i,0,...rect);
    }
  },
  tower(scene,type,level,x,y){
    const key={archer:'ranger',mage:'mage',cannon:'cannon',catapult:'catapult',frost:'mage'}[type];
    const sprite=scene.add.image(x,y+9,key,type==='catapult'?0:level-1).setOrigin(.5,1);
    this.sizeTower(sprite,type,level);if(type==='frost')sprite.setTint(0x99dfff);return sprite;
  },
  sizeTower(sprite,type,level){
    const heights={archer:[106,117,128],mage:[112,125,138],cannon:[90,103,116]};
    const h=(heights[type]||[100,112,124])[level-1];sprite.setScale(h/sprite.frame.height);sprite.setDepth(100+sprite.y);
  },
  upgrade(sprite,type,level){sprite.setFrame(type==='catapult'?0:level-1);this.sizeTower(sprite,type,level);},
  unit(scene,key,frame,x,y,boss){
    const sprite=scene.add.image(x,y,key,frame).setOrigin(.5,.88);
    const height=boss?100:key==='brute'?64:52;sprite.setScale(height/sprite.frame.height);return sprite;
  }
};
