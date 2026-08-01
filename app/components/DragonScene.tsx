"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls, PerspectiveCamera, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  exploded: boolean;
  reducedMotion: boolean;
  scrollProgress: number;
  activeHotspot: string | null;
  onHotspot: (id: string | null) => void;
};

const magenta = new THREE.Color("#d4145a");
const pink = new THREE.Color("#ff3e8a");
const green = new THREE.Color("#39734a");

function LeafFins({ split = 0 }: { split?: number }) {
  const fins = useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const y = -1.02 + (i % 5) * .51;
    const angle = (i / 9) * Math.PI * 4.8 + split * .22;
    const radius = .7 * Math.sqrt(Math.max(.2, 1 - Math.pow(y/1.35, 2)));
    const lift = y < -.45 ? -.52 : .76;
    const normal = new THREE.Vector3(Math.cos(angle)*.62, lift, Math.sin(angle)*.45).normalize();
    const surface = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius * .88);
    const scale = .82 + (i % 4) * .1;
    return {
      base: surface.clone().addScaledVector(normal, .24),
      tip: surface.clone().addScaledVector(normal, .57),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal),
      scale,
    };
  }), [split]);
  return <>{fins.map((f,i) => <group key={i}>
    <mesh position={f.base} quaternion={f.quaternion} scale={[.18*f.scale,.24*f.scale,.06*f.scale]} castShadow>
      <coneGeometry args={[1,2,7]} /><meshPhysicalMaterial color="#e02268" roughness={.4} clearcoat={.2}/>
    </mesh>
    <mesh position={f.tip} quaternion={f.quaternion} scale={[.16*f.scale,.3*f.scale,.045*f.scale]} castShadow>
      <coneGeometry args={[1,2,7]} /><meshPhysicalMaterial color={i%2 ? "#6f873c" : "#436f3c"} roughness={.5} clearcoat={.14}/>
    </mesh>
  </group>)}</>;
}

function Seeds({ side }: { side: number }) {
  const faceTexture = useTexture("/fruit-face.webp");
  faceTexture.colorSpace = THREE.SRGBColorSpace;
  faceTexture.anisotropy = 8;
  return <group position={[side*.015, 0, .705]} scale={[.73,1.12,1]}>
    <mesh receiveShadow><circleGeometry args={[.91, 64]} /><meshPhysicalMaterial map={faceTexture} roughness={.46} clearcoat={.08} sheen={.18} sheenColor="#fff" side={THREE.DoubleSide} /></mesh>
  </group>;
}

function Hotspot({ id, position, active, onClick }: { id:string; position:[number,number,number]; active:boolean; onClick:()=>void }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({clock}) => { if(ref.current) ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime*2.3)*.08); });
  return <group position={position}><mesh ref={ref} onClick={(e)=>{e.stopPropagation();onClick();}} onPointerOver={()=>{document.body.style.cursor="pointer";}} onPointerOut={()=>{document.body.style.cursor="";}}>
    <sphereGeometry args={[.075,16,16]} /><meshStandardMaterial color={active?"#fff":"#ff3e8a"} emissive="#d4145a" emissiveIntensity={active?3:1.5} />
  </mesh><mesh><ringGeometry args={[.11,.125,24]} /><meshBasicMaterial color="#fff" transparent opacity={.55} side={THREE.DoubleSide} /></mesh></group>;
}

function Fruit({ exploded, reducedMotion, scrollProgress, activeHotspot, onHotspot }: Props) {
  const group = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const pointer = useRef({x:0,y:0});
  const device = useRef({x:0,y:0});
  const { invalidate } = useThree();
  const skinTexture = useMemo(() => {
    const size = 128;
    const data = new Uint8Array(size * size);
    for (let y=0; y<size; y++) for (let x=0; x<size; x++) {
      const wave = Math.sin(x*.41) * Math.cos(y*.33) * 18 + Math.sin((x+y)*.17) * 11;
      const pores = ((x*17+y*31)%23===0) ? -38 : 0;
      data[y*size+x] = Math.max(55, Math.min(225, 138 + wave + pores));
    }
    const texture = new THREE.DataTexture(data,size,size,THREE.RedFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.4,3.2);
    texture.needsUpdate = true;
    return texture;
  },[]);
  useEffect(() => {
    const move = (e: PointerEvent) => { pointer.current = {x:e.clientX/innerWidth-.5,y:e.clientY/innerHeight-.5}; if(reducedMotion) invalidate(); };
    const orient = (e: DeviceOrientationEvent) => { device.current={x:(e.gamma||0)/90,y:(e.beta||0)/180}; if(reducedMotion) invalidate(); };
    addEventListener("pointermove",move,{passive:true}); addEventListener("deviceorientation",orient,{passive:true});
    return()=>{removeEventListener("pointermove",move);removeEventListener("deviceorientation",orient);};
  },[invalidate,reducedMotion]);
  useFrame((state, delta) => {
    if(!group.current || !left.current || !right.current) return;
    const target = exploded ? 1.08 : .42;
    left.current.position.x = THREE.MathUtils.damp(left.current.position.x,-target,4,delta);
    right.current.position.x = THREE.MathUtils.damp(right.current.position.x,target,4,delta);
    left.current.rotation.y = THREE.MathUtils.damp(left.current.rotation.y,exploded ? -.18 : -.08,3,delta);
    right.current.rotation.y = THREE.MathUtils.damp(right.current.rotation.y,exploded ? .18 : .08,3,delta);
    const idle = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime*.32)*.07;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y,idle + pointer.current.x*.08,3,delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.current.y*.18 + device.current.y*.08,3,delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z,-pointer.current.x*.12-device.current.x*.08,3,delta);
    const scrollShift = Math.min(scrollProgress*9,1);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x,scrollShift*1.2,2,delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y,-scrollShift*.32,2,delta);
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x,pointer.current.x*.35,2,delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y,-pointer.current.y*.25,2,delta);
    state.camera.lookAt(0,0,0);
  });
  const shellMat = <meshPhysicalMaterial color={magenta} roughness={.36} metalness={.02} clearcoat={.48} clearcoatRoughness={.3} sheen={.46} sheenColor={pink} bumpMap={skinTexture} bumpScale={.055} roughnessMap={skinTexture} />;
  return <Float speed={reducedMotion?0:1.1} rotationIntensity={reducedMotion?0:.08} floatIntensity={reducedMotion?0:.18}>
    <group ref={group} scale={1.03} rotation={[0,0,-.08]} onClick={() => exploded && onHotspot(null)}>
      <group ref={left} position={[-.42,.2,-.24]} scale={.84}>
        <mesh scale={[.78,1.18,.68]} castShadow receiveShadow><sphereGeometry args={[1,64,64]} />{shellMat}</mesh>
        <LeafFins split={-1}/><Seeds side={1}/>
      </group>
      <group ref={right} position={[.42,-.08,.08]} scale={1.04}>
        <mesh scale={[.78,1.18,.68]} castShadow receiveShadow><sphereGeometry args={[1,64,64]} />{shellMat}</mesh>
        <LeafFins split={1}/><Seeds side={-1}/>
      </group>
      {exploded && <group>
        <Hotspot id="flesh" position={[-.38,.42,.8]} active={activeHotspot==="flesh"} onClick={()=>onHotspot("flesh")}/>
        <Hotspot id="seeds" position={[.28,-.22,.95]} active={activeHotspot==="seeds"} onClick={()=>onHotspot("seeds")}/>
        <Hotspot id="quality" position={[-1.38,.78,.12]} active={activeHotspot==="quality"} onClick={()=>onHotspot("quality")}/>
        <Hotspot id="varieties" position={[1.38,-.68,.15]} active={activeHotspot==="varieties"} onClick={()=>onHotspot("varieties")}/>
      </group>}
    </group>
  </Float>;
}

function Foliage() {
  return <group position={[0,-2.2,-1.5]}>{Array.from({length:9},(_,i)=>{
    const a=i/9*Math.PI*2; return <mesh key={i} position={[Math.cos(a)*3.2,Math.sin(a)*.5-1,Math.sin(a)*1.2]} rotation={[0,0,-a+.6]} scale={[.35,1.4,.15]}><sphereGeometry args={[1,18,18]}/><meshStandardMaterial color={i%2?"#234b32":"#39734a"} roughness={.75}/></mesh>;
  })}</group>;
}

export default function DragonScene(props: Props) {
  const [visible,setVisible]=useState(true);
  useEffect(()=>{const fn=()=>setVisible(!document.hidden);document.addEventListener("visibilitychange",fn);return()=>document.removeEventListener("visibilitychange",fn);},[]);
  return <Canvas shadows dpr={[1, typeof window!=="undefined"&&innerWidth<768?1.25:1.65]} frameloop={visible&&!props.reducedMotion?"always":"demand"} gl={{antialias:true,alpha:true,powerPreference:"high-performance"}} onCreated={({gl})=>{gl.setClearColor(0x000000,0);gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.12;}}>
    <PerspectiveCamera makeDefault position={[0,0,5.8]} fov={38}/>
    <ambientLight intensity={.38}/><directionalLight castShadow position={[4,6,4]} intensity={4.4} color="#fff0c9" shadow-mapSize={[1024,1024]}/><spotLight position={[-4,2,4]} intensity={8} angle={.5} penumbra={1} color="#ff3e8a"/><pointLight position={[1,-2,3]} intensity={2.7} color="#39734a"/><pointLight position={[2.8,3.5,2]} intensity={3.5} color="#ffd58b"/>
    <Suspense fallback={null}><Fruit {...props}/><Foliage/><Sparkles count={props.reducedMotion?0:45} scale={[8,5,5]} size={1.6} speed={.12} color="#ff9ac3" opacity={.3}/><ContactShadows position={[0,-2.2,0]} opacity={.55} scale={7} blur={2.8} far={4}/></Suspense>
    <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI*.32} maxPolarAngle={Math.PI*.68} rotateSpeed={.45}/>
  </Canvas>;
}
