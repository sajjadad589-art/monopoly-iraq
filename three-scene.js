(()=>{
  const host=document.getElementById('threeScene');
  if(!host||!window.THREE)return;

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(38,1,.1,100);
  camera.position.set(7.7,7.1,9.1);
  camera.lookAt(0,.35,0);

  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.08;
  host.innerHTML='';
  host.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xc7e2ff,0x25190e,1.6));
  const sun=new THREE.DirectionalLight(0xffe7b0,2.2);sun.position.set(4,9,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
  const blue=new THREE.PointLight(0x3aa8ff,12,20,2);blue.position.set(-5,3,-4);scene.add(blue);
  const warm=new THREE.PointLight(0xffb13b,10,18,2);warm.position.set(4,3,3);scene.add(warm);

  const root=new THREE.Group();root.rotation.x=-.05;scene.add(root);
  const mat=(color,rough=.7,metal=.08)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
  const box=(w,h,d,color,x,y,z,rough=.7,metal=.05)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,rough,metal));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);return m};
  const cyl=(r1,r2,h,color,x,y,z,segments=20)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),mat(color,.55,.05));m.position.set(x,y,z);m.castShadow=true;root.add(m);return m};
  const sphere=(r,color,x,y,z)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),mat(color,.5,.08));m.position.set(x,y,z);m.castShadow=true;root.add(m);return m};

  box(10.8,.22,10.8,0x7c6d55,0,-.35,0,.9,0);
  box(9.9,.18,9.9,0x33473c,0,-.18,0,.95,0);

  const river=new THREE.Mesh(new THREE.PlaneGeometry(2.35,10.2),new THREE.MeshPhysicalMaterial({color:0x1379a7,roughness:.22,metalness:.05,transparent:true,opacity:.9,clearcoat:1}));
  river.rotation.x=-Math.PI/2;river.rotation.z=.16;river.position.set(.3,-.05,.1);river.receiveShadow=true;root.add(river);

  box(3.35,.16,1.05,0xd4b47a,.2,.18,.15,.65,.08);
  for(let i=-2;i<=2;i++)cyl(.08,.08,.55,0x725536,-1.25+i*.63,-.08,.15,10);

  box(2.6,1.15,1.8,0xc7aa78,-2.25,.55,-1.55,.78,.04);
  box(2.9,.25,2.05,0x8e704d,-2.25,1.2,-1.55,.7,.05);
  for(let i=-1;i<=1;i++)box(.26,.95,.28,0xe6d5ae,-2.25+i*.65,.55,-.58,.72,.02);

  cyl(1.12,1.12,.55,0xd7bd8a,2.5,.35,-1.6,28);
  sphere(.8,0xe6b52d,2.5,1.08,-1.6);
  cyl(.08,.12,.8,0xe8c455,2.5,1.75,-1.6,12);
  sphere(.1,0xffdc65,2.5,2.18,-1.6);

  [[1.35,-2.5],[3.65,-2.5]].forEach(([x,z])=>{
    cyl(.22,.28,2.8,0xcbb78b,x,1.25,z,16);
    cyl(.31,.2,.32,0xd9a52b,x,2.68,z,16);
    sphere(.23,0xe8b52e,x,2.98,z);
    cyl(.045,.06,.55,0xeecb62,x,3.35,z,10);
  });

  const towerColors=[0x5f7784,0x7e8e95,0x526a76,0x697f8a];
  [[-3.5,2.6,1.6],[-2.65,3.0,2.2],[3.4,2.7,2.0],[4.0,1.9,1.35]].forEach((v,i)=>{const[x,z,h]=v;const b=box(.7,h,.7,towerColors[i%towerColors.length],x,h/2-.05,z,.38,.25);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry),new THREE.LineBasicMaterial({color:0x9fd7ff,transparent:true,opacity:.22}));b.add(edges)});

  const archMat=mat(0xd2bc8b,.65,.08);
  const p1=new THREE.Mesh(new THREE.BoxGeometry(.38,2.15,.48),archMat);p1.position.set(-.95,.95,2.7);p1.rotation.z=-.18;p1.castShadow=true;root.add(p1);
  const p2=p1.clone();p2.position.x=.1;p2.rotation.z=.18;root.add(p2);
  box(1.35,.35,.52,0xd2bc8b,-.42,2.0,2.7,.65,.08);

  function palm(x,z,s=1){
    const trunk=cyl(.085,.13,1.25*s,0x865b2d,x,.43*s,z,10);trunk.rotation.z=.04;
    const crown=new THREE.Group();crown.position.set(x,1.1*s,z);root.add(crown);
    for(let i=0;i<7;i++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.16*s,.95*s,7),mat(0x2f8a45,.9,0));leaf.rotation.z=Math.PI/2.55;leaf.rotation.y=(i/7)*Math.PI*2;leaf.position.y=.12;leaf.castShadow=true;crown.add(leaf)}
  }
  [[-4,3.6],[-3.5,-3.7],[4.2,3.5],[3.7,-3.4],[-1.2,4.1],[1.5,3.9]].forEach(([x,z],i)=>palm(x,z,.85+(i%2)*.15));

  const houseColors=[0xd7c29a,0xa88460,0xc9b188,0xb88e63];
  for(let i=0;i<16;i++){const angle=(i/16)*Math.PI*2,radius=4.0+(i%3)*.28,x=Math.cos(angle)*radius,z=Math.sin(angle)*radius,h=.28+(i%4)*.12;box(.42,h,.42,houseColors[i%houseColors.length],x,h/2-.02,z,.78,.02)}

  function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  new ResizeObserver(resize).observe(host);resize();

  let t=0;
  function animate(){requestAnimationFrame(animate);t+=.015;river.material.opacity=.88+Math.sin(t)*.02;renderer.render(scene,camera)}
  animate();
})();
