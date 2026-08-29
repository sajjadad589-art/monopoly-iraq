(()=>{
  const host=document.getElementById('threeScene');if(!host||!window.THREE)return;const THREE=window.THREE;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(32,1,.1,120);
  const mobile=window.matchMedia('(max-width:760px)').matches;
  camera.position.set(mobile?0:7.2,mobile?8.9:7.2,mobile?9.6:9.1);camera.lookAt(0,.72,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mobile?1.3:1.55));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;host.innerHTML='';host.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xb9dcff,0x4f331d,1.25));
  const sun=new THREE.DirectionalLight(0xffe2a6,2.15);sun.position.set(4,9,6);sun.castShadow=true;sun.shadow.mapSize.set(mobile?512:1024,mobile?512:1024);scene.add(sun);
  const blueFill=new THREE.DirectionalLight(0x4fa4ff,.8);blueFill.position.set(-5,5,-4);scene.add(blueFill);
  const warm=new THREE.PointLight(0xffb33f,4.5,13,2);warm.position.set(0,2.6,2.8);scene.add(warm);
  const root=new THREE.Group();root.rotation.x=-.02;scene.add(root);
  const mat=(c,r=.62,m=.04)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  const box=(w,h,d,c,x,y,z,r=.62,m=.04,parent=root)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,r,m));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
  const cyl=(r1,r2,h,c,x,y,z,seg=18,parent=root)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),mat(c,.58,.04));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
  const sphere=(r,c,x,y,z,parent=root)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),mat(c,.45,.06));o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o};

  box(9.75,.15,9.75,0xb79569,0,-.12,0,.9,.01);box(9.0,.10,9.0,0xd3ba8f,0,.01,0,.95,0);
  const waterMat=new THREE.MeshPhysicalMaterial({color:0x087eb9,roughness:.13,metalness:.02,transparent:true,opacity:.92,clearcoat:1,clearcoatRoughness:.12});
  const water=new THREE.Mesh(new THREE.RingGeometry(2.8,4.08,64),waterMat);water.rotation.x=-Math.PI/2;water.position.y=.08;root.add(water);
  const island=new THREE.Mesh(new THREE.CircleGeometry(2.7,64),mat(0xc9aa77,.9,0));island.rotation.x=-Math.PI/2;island.position.y=.095;root.add(island);
  const road=new THREE.Mesh(new THREE.RingGeometry(2.2,2.58,64),mat(0x32373b,.78,.03));road.rotation.x=-Math.PI/2;road.position.y=.112;root.add(road);
  const line=new THREE.Mesh(new THREE.RingGeometry(2.37,2.40,64),new THREE.MeshBasicMaterial({color:0xe6eff6,transparent:true,opacity:.8,side:THREE.DoubleSide}));line.rotation.x=-Math.PI/2;line.position.y=.118;root.add(line);

  const gate=new THREE.Group();gate.position.set(0,.12,-.25);gate.scale.set(1.12,1.12,1.12);root.add(gate);
  const blue=0x064f9b,blue2=0x0871d1,gold=0xe0a92f,stone=0xf0d99f,dark=0x101922;
  box(3.65,.42,1.16,blue,0,.24,0,.36,.10,gate);box(3.25,2.42,1.06,blue,0,1.58,0,.34,.12,gate);box(.86,3.18,1.13,blue2,-1.39,1.96,0,.31,.14,gate);box(.86,3.18,1.13,blue2,1.39,1.96,0,.31,.14,gate);
  box(1.0,1.72,1.36,dark,0,1.03,.04,.88,0,gate);
  const arch=new THREE.Mesh(new THREE.TorusGeometry(.52,.17,12,40,Math.PI),mat(gold,.34,.25));arch.rotation.z=Math.PI;arch.position.set(0,1.86,.62);gate.add(arch);
  for(let x=-1.78;x<=1.78;x+=.43)box(.26,.3,1.18,stone,x,3.10,0,.68,.03,gate);
  for(const tx of [-1.39,1.39])for(let x=-.34;x<=.34;x+=.34)box(.21,.29,1.19,stone,tx+x,3.58,0,.68,.03,gate);
  for(const x of [-1.39,1.39])for(const y of [1.05,1.55,2.05,2.55])box(.40,.18,.065,gold,x,y,.595,.32,.26,gate);
  for(const x of [-.94,-.47,.47,.94])box(.38,.18,.065,gold,x,2.59,.595,.32,.26,gate);
  for(let i=0;i<4;i++)box(2.8-i*.2,.09,.48,0xd9be8e,0,.18+i*.05,1.04+i*.23,.88,0);box(3.5,.1,2.12,0xd7bd8d,0,.15,1.78,.9,0);

  function palm(x,z,s=1){const trunk=cyl(.075,.11,1.14*s,0x80552b,x,.51*s,z,9);const crown=new THREE.Group();crown.position.set(x,1.02*s,z);root.add(crown);for(let i=0;i<8;i++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.12*s,.82*s,7),mat(0x168844,.82,0));leaf.rotation.z=Math.PI/2.55;leaf.rotation.y=i/8*Math.PI*2;leaf.position.y=.08;crown.add(leaf)}}
  [[-3.28,-2.15],[3.28,-2.15],[-3.4,2.15],[3.4,2.15],[-2.3,3],[2.3,3]].forEach(([x,z],i)=>palm(x,z,.9+(i%2)*.07));
  for(const [x,z] of [[-2.3,1.75],[2.3,1.75],[-2.55,-1.8],[2.55,-1.8]]){cyl(.055,.07,.42,0x82582e,x,.28,z,9);sphere(.085,0xffc14e,x,.54,z)}

  function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(host);resize();
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;let t=0,targetX=0,targetY=0,rx=0,ry=0;
  if(!mobile){host.closest('.board')?.addEventListener('pointermove',e=>{if(reduce)return;const r=host.getBoundingClientRect();targetX=((e.clientX-r.left)/Math.max(1,r.width)-.5)*.14;targetY=((e.clientY-r.top)/Math.max(1,r.height)-.5)*.08},{passive:true});host.closest('.board')?.addEventListener('pointerleave',()=>{targetX=0;targetY=0},{passive:true})}
  function animate(){requestAnimationFrame(animate);t+=.012;waterMat.opacity=.90+Math.sin(t*2)*.015;if(!reduce&&!mobile){rx+=(targetX-rx)*.04;ry+=(targetY-ry)*.04;root.rotation.y=rx;root.rotation.x=-.02-ry}renderer.render(scene,camera)}animate();
})();