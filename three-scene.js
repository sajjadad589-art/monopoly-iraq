(()=>{
  const host=document.getElementById('threeScene');
  if(!host||!window.THREE) return;

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(38,1,.1,100);
  camera.position.set(7.8,7.2,9.2);
  camera.lookAt(0,0,0);

  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.12;
  host.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xbfdcff,0x25190e,1.7));
  const sun=new THREE.DirectionalLight(0xffe7b0,2.3);
  sun.position.set(4,9,6); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  scene.add(sun);
  const blue=new THREE.PointLight(0x3aa8ff,16,22,2); blue.position.set(-5,3,-4); scene.add(blue);
  const warm=new THREE.PointLight(0xffb13b,12,18,2); warm.position.set(4,3,3); scene.add(warm);

  const root=new THREE.Group();
  root.rotation.x=-.06;
  scene.add(root);

  function mat(color,rough=.7,metal=.08){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal})}
  function box(w,h,d,color,x,y,z,rough=.7,metal=.05){
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,rough,metal));
    m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; root.add(m); return m;
  }
  function cyl(r1,r2,h,color,x,y,z,segments=20){
    const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),mat(color,.55,.05));
    m.position.set(x,y,z); m.castShadow=true; root.add(m); return m;
  }
  function sphere(r,color,x,y,z){const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),mat(color,.5,.08));m.position.set(x,y,z);m.castShadow=true;root.add(m);return m}

  // stone plaza
  box(10.8,.22,10.8,0x7c6d55,0,-.35,0,.9,0);
  box(9.9,.18,9.9,0x33473c,0,-.18,0,.95,0);

  // Tigris/Euphrates inspired river
  const river=new THREE.Mesh(new THREE.PlaneGeometry(2.35,10.2),new THREE.MeshPhysicalMaterial({color:0x1379a7,roughness:.22,metalness:.05,transparent:true,opacity:.92,clearcoat:1}));
  river.rotation.x=-Math.PI/2; river.rotation.z=.16; river.position.set(.3,-.05,.1); river.receiveShadow=true; root.add(river);

  // bridge
  box(3.35,.16,1.05,0xd4b47a,.2,.18,.15,.65,.08);
  for(let i=-2;i<=2;i++) cyl(.08,.08,.55,0x725536,-1.25+i*.63,-.08,.15,10);

  // central civic building
  box(2.6,1.15,1.8,0xc7aa78,-2.25,.55,-1.55,.78,.04);
  box(2.9,.25,2.05,0x8e704d,-2.25,1.2,-1.55,.7,.05);
  for(let i=-1;i<=1;i++) box(.26,.95,.28,0xe6d5ae,-2.25+i*.65,.55,-.58,.72,.02);

  // golden dome landmark
  cyl(1.12,1.12,.55,0xd7bd8a,2.5,.35,-1.6,28);
  sphere(.8,0xe6b52d,2.5,1.08,-1.6);
  cyl(.08,.12,.8,0xe8c455,2.5,1.75,-1.6,12);
  sphere(.1,0xffdc65,2.5,2.18,-1.6);

  // minarets
  [[1.35,-2.5],[3.65,-2.5]].forEach(([x,z])=>{
    cyl(.22,.28,2.8,0xcbb78b,x,1.25,z,16);
    cyl(.31,.2,.32,0xd9a52b,x,2.68,z,16);
    sphere(.23,0xe8b52e,x,2.98,z);
    cyl(.045,.06,.55,0xeecb62,x,3.35,z,10);
  });

  // modern towers
  const towerColors=[0x5f7784,0x7e8e95,0x526a76,0x697f8a];
  [[-3.5,2.6,1.6],[-2.65,3.0,2.2],[3.4,2.7,2.0],[4.0,1.9,1.35]].forEach((v,i)=>{
    const [x,z,h]=v; const b=box(.7,h,.7,towerColors[i%towerColors.length],x,h/2-.05,z,.38,.25);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry),new THREE.LineBasicMaterial({color:0x9fd7ff,transparent:true,opacity:.22})); b.add(edges);
  });

  // arch monument
  const archMat=mat(0xd2bc8b,.65,.08);
  const p1=new THREE.Mesh(new THREE.BoxGeometry(.38,2.15,.48),archMat); p1.position.set(-.95,.95,2.7); p1.rotation.z=-.18; p1.castShadow=true; root.add(p1);
  const p2=p1.clone(); p2.position.x=.1; p2.rotation.z=.18; root.add(p2);
  box(1.35,.35,.52,0xd2bc8b,-.42,2.0,2.7,.65,.08);

  // palms
  function palm(x,z,s=1){
    const trunk=cyl(.085,.13,1.25*s,0x865b2d,x,.43*s,z,10); trunk.rotation.z=.04;
    const crown=new THREE.Group(); crown.position.set(x,1.1*s,z); root.add(crown);
    for(let i=0;i<7;i++){
      const leaf=new THREE.Mesh(new THREE.ConeGeometry(.16*s,.95*s,7),mat(0x2f8a45,.9,0));
      leaf.rotation.z=Math.PI/2.55; leaf.rotation.y=(i/7)*Math.PI*2; leaf.position.y=.12; leaf.castShadow=true; crown.add(leaf);
    }
  }
  [[-4,3.6],[-3.5,-3.7],[4.2,3.5],[3.7,-3.4],[-1.2,4.1],[1.5,3.9]].forEach(([x,z],i)=>palm(x,z,.85+(i%2)*.15));

  // tiny houses to sell the 3D city feeling
  const houseColors=[0xd7c29a,0xa88460,0xc9b188,0xb88e63];
  for(let i=0;i<16;i++){
    const angle=(i/16)*Math.PI*2;
    const radius=4.0+(i%3)*.28;
    const x=Math.cos(angle)*radius,z=Math.sin(angle)*radius;
    const h=.28+(i%4)*.12;
    box(.42,h,.42,houseColors[i%houseColors.length],x,h/2-.02,z,.78,.02);
  }

  // subtle glowing city lights
  const lightGeo=new THREE.SphereGeometry(.055,8,6);
  for(let i=0;i<28;i++){
    const a=(i/28)*Math.PI*2, r=3.3+(i%4)*.35;
    const m=new THREE.Mesh(lightGeo,new THREE.MeshBasicMaterial({color:i%2?0xffcf72:0x7cd6ff}));
    m.position.set(Math.cos(a)*r,.18+(i%3)*.12,Math.sin(a)*r); root.add(m);
  }

  function resize(){
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host); resize();

  let t=0;
  function animate(){
    requestAnimationFrame(animate); t+=.004;
    root.rotation.y=Math.sin(t)*.055;
    river.material.opacity=.88+Math.sin(t*7)*.035;
    renderer.render(scene,camera);
  }
  animate();

  // camera follows board rotation/player side selected by game engine
  const board=document.getElementById('board');
  const observer=new MutationObserver(()=>{
    const rot=getComputedStyle(board).getPropertyValue('--rot').trim();
    const deg=parseFloat(rot)||0;
    const rad=deg*Math.PI/180;
    camera.position.x=Math.sin(rad)*8.5;
    camera.position.z=Math.cos(rad)*8.5;
    camera.position.y=7.3;
    camera.lookAt(0,.4,0);
  });
  observer.observe(board,{attributes:true,attributeFilter:['style','class']});
})();
