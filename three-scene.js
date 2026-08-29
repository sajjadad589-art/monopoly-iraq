(()=>{
  const host=document.getElementById('threeScene');
  if(!host||!window.THREE)return;

  const scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x07131f,.025);

  const camera=new THREE.PerspectiveCamera(36,1,.1,120);
  camera.position.set(8.6,8.4,10.8);
  camera.lookAt(0,.35,0);

  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.1;
  host.innerHTML='';
  host.appendChild(renderer.domElement);

  const hemi=new THREE.HemisphereLight(0xbfe5ff,0x241508,1.45);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffe0a3,2.7);sun.position.set(5,11,7);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;scene.add(sun);
  const blue=new THREE.PointLight(0x249cff,14,22,2);blue.position.set(-5,4,-4);scene.add(blue);
  const warm=new THREE.PointLight(0xffa72f,11,18,2);warm.position.set(4,3.2,3);scene.add(warm);

  const root=new THREE.Group();root.rotation.x=-.035;scene.add(root);
  const mat=(color,rough=.7,metal=.08)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
  const box=(w,h,d,color,x,y,z,rough=.7,metal=.05,parent=root)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,rough,metal));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
  const cyl=(r1,r2,h,color,x,y,z,segments=20,parent=root)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),mat(color,.56,.06));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
  const sphere=(r,color,x,y,z,parent=root)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,18),mat(color,.48,.08));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m};

  // Board foundation with visible depth.
  box(11.25,.36,11.25,0x4b311d,0,-.48,0,.85,.06);
  box(10.75,.18,10.75,0x263a32,0,-.2,0,.92,.02);

  // Inner city platform.
  const cityBase=box(8.75,.14,8.75,0x1f342d,0,-.06,0,.96,.02);
  cityBase.receiveShadow=true;

  // Tigris/Euphrates inspired water ribbon.
  const river=new THREE.Mesh(
    new THREE.PlaneGeometry(2.15,9.45,1,18),
    new THREE.MeshPhysicalMaterial({color:0x087da9,roughness:.18,metalness:.04,transparent:true,opacity:.92,clearcoat:1,clearcoatRoughness:.16})
  );
  river.rotation.x=-Math.PI/2;river.rotation.z=.12;river.position.set(.35,.035,.05);river.receiveShadow=true;root.add(river);

  // Main illuminated bridge.
  box(4.0,.16,.88,0xc9ad7c,.15,.26,.12,.62,.08);
  box(4.08,.08,1.02,0x5f452d,.15,.12,.12,.78,.04);
  for(let i=-3;i<=3;i++)cyl(.055,.065,.64,0x6f5031,-1.55+i*.55,-.06,.12,10);
  for(const x of [-1.63,1.93]){
    cyl(.08,.11,.75,0xd2b36e,x,.58,.55,10); sphere(.07,0xffd66b,x,.98,.55);
    cyl(.08,.11,.75,0xd2b36e,x,.58,-.31,10); sphere(.07,0xffd66b,x,.98,-.31);
  }

  // Ziggurat inspired stepped landmark.
  const zig=new THREE.Group();zig.position.set(-2.55,0,-1.75);root.add(zig);
  box(2.35,.42,2.05,0xb6935f,0,.22,0,.82,.03,zig);
  box(1.82,.4,1.55,0xc3a06a,0,.62,0,.8,.03,zig);
  box(1.28,.36,1.05,0xd0af78,0,1.0,0,.78,.03,zig);
  box(.62,.48,.58,0xdfc48d,0,1.42,0,.74,.04,zig);
  const stair=box(.55,.12,1.5,0x9b7549,0,.46,1.02,.86,.02,zig);stair.rotation.x=-.34;

  // Golden shrine dome and minarets.
  cyl(1.02,1.02,.48,0xd6bc88,2.45,.32,-1.45,32);
  sphere(.77,0xe9b72e,2.45,1.02,-1.45);
  cyl(.07,.11,.78,0xe6c25a,2.45,1.66,-1.45,12);sphere(.09,0xffdc62,2.45,2.08,-1.45);
  [[1.28,-2.36],[3.58,-2.36]].forEach(([x,z])=>{
    cyl(.2,.27,2.55,0xcab68a,x,1.13,z,18);
    cyl(.29,.18,.3,0xe0aa2a,x,2.45,z,16);
    sphere(.2,0xe9b72e,x,2.7,z);
    cyl(.04,.06,.48,0xeec961,x,3.03,z,10);
  });

  // Modern Baghdad skyline.
  const towerColors=[0x506875,0x6d8188,0x455c69,0x627985,0x385361];
  [[-3.7,2.6,1.45],[-2.92,3.12,2.15],[-2.15,3.42,1.15],[3.5,2.55,1.8],[4.0,1.75,1.25],[3.05,3.42,1.45]].forEach((v,i)=>{
    const[x,z,h]=v,b=box(.63,h,.63,towerColors[i%towerColors.length],x,h/2-.03,z,.34,.28);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry),new THREE.LineBasicMaterial({color:0xa8dcff,transparent:true,opacity:.22}));b.add(edges);
    for(let y=.25;y<h-.12;y+=.31){const light=box(.4,.035,.015,0xf1c45d,x,y,z+.323,.3,.12);light.castShadow=false;}
  });

  // Freedom Monument inspired arch silhouette.
  const archMat=mat(0xd3bd8c,.62,.08);
  const p1=new THREE.Mesh(new THREE.BoxGeometry(.38,2.08,.48),archMat);p1.position.set(-.95,.93,2.35);p1.rotation.z=-.2;p1.castShadow=true;root.add(p1);
  const p2=p1.clone();p2.position.x=.1;p2.rotation.z=.2;root.add(p2);
  box(1.35,.34,.52,0xd3bd8c,-.42,1.92,2.35,.62,.08);

  function palm(x,z,s=1){
    const trunk=cyl(.075,.12,1.15*s,0x7f552b,x,.43*s,z,10);trunk.rotation.z=.035;
    const crown=new THREE.Group();crown.position.set(x,1.0*s,z);root.add(crown);
    for(let i=0;i<8;i++){
      const leaf=new THREE.Mesh(new THREE.ConeGeometry(.13*s,.86*s,7),mat(0x2d8747,.9,0));
      leaf.rotation.z=Math.PI/2.55;leaf.rotation.y=(i/8)*Math.PI*2;leaf.position.y=.1;leaf.castShadow=true;crown.add(leaf);
    }
  }
  [[-4.05,3.45],[-3.75,-3.6],[4.1,3.42],[3.68,-3.3],[-1.45,4.05],[1.5,3.9],[-4.1,-.15],[4.05,.2]].forEach(([x,z],i)=>palm(x,z,.82+(i%3)*.08));

  // Houses around the city give the scene real depth.
  const houseColors=[0xd3bd95,0xa87f59,0xc5ad83,0xb68b63,0x927257];
  for(let i=0;i<24;i++){
    const angle=(i/24)*Math.PI*2,radius=3.75+(i%4)*.22,x=Math.cos(angle)*radius,z=Math.sin(angle)*radius,h=.24+(i%5)*.09;
    const house=box(.4,h,.4,houseColors[i%houseColors.length],x,h/2-.01,z,.78,.02);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(.33,.2,4),mat(i%2?0x7d4b32:0x674434,.8,.02));roof.position.set(x,h+.08,z);roof.rotation.y=Math.PI/4;roof.castShadow=true;root.add(roof);
    house.rotation.y=-angle;
  }

  // Ambient gold particles for premium game-table feel.
  const particles=90,geo=new THREE.BufferGeometry(),arr=new Float32Array(particles*3);
  for(let i=0;i<particles;i++){arr[i*3]=(Math.random()-.5)*10;arr[i*3+1]=.15+Math.random()*3.8;arr[i*3+2]=(Math.random()-.5)*10;}
  geo.setAttribute('position',new THREE.BufferAttribute(arr,3));
  const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xe8c36c,size:.028,transparent:true,opacity:.42,depthWrite:false}));root.add(pts);

  function resize(){
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);resize();

  let t=0,mouseX=0,mouseY=0,targetX=0,targetY=0;
  host.closest('.board')?.addEventListener('pointermove',e=>{
    const r=host.getBoundingClientRect();targetX=((e.clientX-r.left)/Math.max(1,r.width)-.5)*.42;targetY=((e.clientY-r.top)/Math.max(1,r.height)-.5)*.24;
  },{passive:true});
  host.closest('.board')?.addEventListener('pointerleave',()=>{targetX=0;targetY=0;},{passive:true});

  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  function animate(){
    requestAnimationFrame(animate);t+=.012;
    river.material.opacity=.89+Math.sin(t*2)*.025;
    pts.rotation.y=t*.035;
    if(!reduce){
      mouseX+=(targetX-mouseX)*.035;mouseY+=(targetY-mouseY)*.035;
      root.rotation.y=mouseX;root.rotation.x=-.035-mouseY;
      camera.position.y=8.35+Math.sin(t*.5)*.06;
    }
    renderer.render(scene,camera);
  }
  animate();
})();
