(()=>{
  const host=document.getElementById('threeScene');
  if(!host||!window.THREE)return;
  const THREE=window.THREE;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,120);
  camera.position.set(7.7,7.1,9.4); camera.lookAt(0,.45,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.55));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;
  host.innerHTML='';host.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xe9f7ff,0x8c6945,2.05));
  const sun=new THREE.DirectionalLight(0xfff1cf,3.2);sun.position.set(4.5,10,5.5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
  const fill=new THREE.DirectionalLight(0x9edcff,1.15);fill.position.set(-5,5,-4);scene.add(fill);
  const warm=new THREE.PointLight(0xffc15d,8,14,2);warm.position.set(0,2.8,2.6);scene.add(warm);

  const root=new THREE.Group();root.rotation.x=-.025;scene.add(root);
  const mat=(c,r=.65,m=.04)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  const box=(w,h,d,c,x,y,z,r=.65,m=.04,parent=root)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,r,m));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
  const cyl=(r1,r2,h,c,x,y,z,seg=20,parent=root)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),mat(c,.58,.04));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
  const sphere=(r,c,x,y,z,parent=root)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,22,16),mat(c,.48,.06));o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o};

  // clean stone plaza
  box(9.7,.16,9.7,0xc7ad86,0,-.12,0,.92,.01);
  box(8.95,.10,8.95,0xdac39e,0,.01,0,.96,.0);

  // water ring framing the monument
  const waterMat=new THREE.MeshPhysicalMaterial({color:0x1698c8,roughness:.16,metalness:.02,transparent:true,opacity:.9,clearcoat:1,clearcoatRoughness:.12});
  const water=new THREE.Mesh(new THREE.RingGeometry(2.75,4.05,64),waterMat);water.rotation.x=-Math.PI/2;water.position.y=.08;water.receiveShadow=true;root.add(water);
  const island=new THREE.Mesh(new THREE.CircleGeometry(2.65,64),mat(0xcdb28b,.92,.0));island.rotation.x=-Math.PI/2;island.position.y=.095;island.receiveShadow=true;root.add(island);

  // inner road used visually for player path separation
  const road=new THREE.Mesh(new THREE.RingGeometry(2.18,2.58,64),mat(0x44484c,.82,.03));road.rotation.x=-Math.PI/2;road.position.y=.112;root.add(road);
  const roadLine=new THREE.Mesh(new THREE.RingGeometry(2.37,2.40,64),new THREE.MeshBasicMaterial({color:0xd6e6ee,transparent:true,opacity:.75,side:THREE.DoubleSide}));roadLine.rotation.x=-Math.PI/2;roadLine.position.y=.118;root.add(roadLine);

  // Ishtar Gate inspired central landmark
  const gate=new THREE.Group();gate.position.set(0,.12,-.2);root.add(gate);
  const blue=0x14559a,blue2=0x1e6cbd,gold=0xd7a63d,stone=0xe7cf9c;
  box(3.55,.42,1.15,blue,0,.24,0,.43,.08,gate);
  box(3.2,2.35,1.05,blue,0,1.55,0,.38,.1,gate);
  box(.82,3.05,1.12,blue2,-1.36,1.9,0,.35,.12,gate);
  box(.82,3.05,1.12,blue2,1.36,1.9,0,.35,.12,gate);
  // arch opening
  box(1.0,1.65,1.35,0x17202b,0,1.0,.03,.95,.0,gate);
  const arch=new THREE.Mesh(new THREE.TorusGeometry(.5,.18,12,36,Math.PI),mat(gold,.45,.18));arch.rotation.z=Math.PI;arch.position.set(0,1.8,.61);gate.add(arch);
  // battlements
  for(let x=-1.72;x<=1.72;x+=.43)box(.25,.28,1.16,stone,x,3.02,0,.72,.02,gate);
  for(const tx of [-1.36,1.36])for(let x=-.34;x<=.34;x+=.34)box(.2,.26,1.18,stone,tx+x,3.47,0,.72,.02,gate);
  // gold decorative animal plaques (simple reliefs)
  const plaque=(x,y)=>{const p=box(.38,.18,.06,gold,x,y,.59,.4,.2,gate);p.rotation.z=(x<0?-.04:.04)};
  for(const x of [-1.36,1.36])for(const y of [1.05,1.55,2.05,2.55])plaque(x,y);
  for(const x of [-.92,-.46,.46,.92])plaque(x,2.55);

  // stairs and entry court
  for(let i=0;i<4;i++)box(2.6-i*.18,.09,.46,0xd5bd94,0,.18+i*.05,1.05+i*.23,.9,.0);
  box(3.45,.1,2.05,0xd8c19a,0,.15,1.75,.92,.0);

  function palm(x,z,s=1){
    const trunk=cyl(.075,.11,1.15*s,0x845a32,x,.52*s,z,10);trunk.rotation.z=.02;
    const crown=new THREE.Group();crown.position.set(x,1.05*s,z);root.add(crown);
    for(let i=0;i<8;i++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.12*s,.82*s,7),mat(0x2d9a4b,.86,0));leaf.rotation.z=Math.PI/2.55;leaf.rotation.y=i/8*Math.PI*2;leaf.position.y=.08;leaf.castShadow=true;crown.add(leaf)}
  }
  [[-3.25,-2.1],[3.25,-2.1],[-3.35,2.2],[3.35,2.2],[-2.25,2.95],[2.25,2.95]].forEach(([x,z],i)=>palm(x,z,.9+(i%2)*.08));

  // small warm lamps, subtle not cluttered
  for(const [x,z] of [[-2.25,1.7],[2.25,1.7],[-2.5,-1.8],[2.5,-1.8]]){cyl(.055,.07,.42,0x8b6338,x,.28,z,10);sphere(.09,0xffd16f,x,.54,z);}

  function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  new ResizeObserver(resize).observe(host);resize();
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;let t=0,targetX=0,targetY=0,rx=0,ry=0;
  host.closest('.board')?.addEventListener('pointermove',e=>{if(reduce)return;const r=host.getBoundingClientRect();targetX=((e.clientX-r.left)/Math.max(1,r.width)-.5)*.18;targetY=((e.clientY-r.top)/Math.max(1,r.height)-.5)*.1},{passive:true});
  host.closest('.board')?.addEventListener('pointerleave',()=>{targetX=0;targetY=0},{passive:true});
  function animate(){requestAnimationFrame(animate);t+=.012;waterMat.opacity=.88+Math.sin(t*2)*.018;if(!reduce){rx+=(targetX-rx)*.04;ry+=(targetY-ry)*.04;root.rotation.y=rx;root.rotation.x=-.025-ry;camera.position.y=7.1+Math.sin(t*.45)*.035;}renderer.render(scene,camera)}animate();
})();
