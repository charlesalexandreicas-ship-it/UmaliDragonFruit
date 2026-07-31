"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Float, OrbitControls, PerspectiveCamera, Sparkles } from "@react-three/drei";
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
  const fins = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    y: -1.15 + (i % 5) * .54,
    angle: (i / 15) * Math.PI * 5.2,
    scale: .75 + (i % 3) * .12,
  })), []);
  return <>{fins.map((f,i) => {
    const radius = .72 * Math.sqrt(Math.max(.15, 1 - Math.pow(f.y/1.48, 2)));
    const x = Math.cos(f.angle) * radius;
    const z = Math.sin(f.angle) * radius;
    if (split && Math.sign(x || 1) !== split) return null;
    return <mesh key={i} position={[x, f.y, z]} rotation={[Math.PI/2, f.angle + Math.PI/2, 0]} scale={[.12*f.scale,.36*f.scale,.08]} castShadow>
      <coneGeometry args={[1, 2, 5]} /><meshStandardMaterial color={i%2 ? "#4d8558" : "#2f6740"} roughness={.42} metalness={.03} />
    </mesh>;
  })}</>;
}

function Seeds({ side }: { side: number }) {
  const seeds = useMemo(() => Array.from({ length: 54 }, (_, i) => {
    const a = i * 2.3999;
    const r = .08 + .72 * Math.sqrt((i+.5)/54);
    return { y: Math.sin(a)*r*1.18, z: Math.cos(a)*r, rot: a };
  }), []);
  return <group position={[side*.605, 0, 0]} rotation={[0, side>0 ? -Math.PI/2 : Math.PI/2, 0]}>
    <mesh receiveShadow><circleGeometry args={[.86, 48]} /><meshPhysicalMaterial color="#fffaf3" roughness={.3} clearcoat={.25} side={THREE.DoubleSide} /></mesh>
    {seeds.map((s,i) => <mesh key={i} position={[s.z,s.y,.008]} rotation={[0,0,s.rot]} scale={[.026,.05,.02]}><sphereGeometry args={[1,8,8]} /><meshStandardMaterial color="#171717" roughness={.65} /></mesh>)}
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
  useEffect(() => {
    const move = (e: PointerEvent) => { pointer.current = {x:e.clientX/innerWidth-.5,y:e.clientY/innerHeight-.5}; if(reducedMotion) invalidate(); };
    const orient = (e: DeviceOrientationEvent) => { device.current={x:(e.gamma||0)/90,y:(e.beta||0)/180}; if(reducedMotion) invalidate(); };
    addEventListener("pointermove",move,{passive:true}); addEventListener("deviceorientation",orient,{passive:true});
    return()=>{removeEventListener("pointermove",move);removeEventListener("deviceorientation",orient);};
  },[invalidate,reducedMotion]);
  useFrame((state, delta) => {
    if(!group.current || !left.current || !right.current) return;
    const target = exploded ? 1.05 : 0;
    left.current.position.x = THREE.MathUtils.damp(left.current.position.x,-target,4,delta);
    right.current.position.x = THREE.MathUtils.damp(right.current.position.x,target,4,delta);
    if(!reducedMotion) group.current.rotation.y += delta*.11;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.current.y*.18 + device.current.y*.08,3,delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z,-pointer.current.x*.12-device.current.x*.08,3,delta);
    const scrollShift = Math.min(scrollProgress*9,1);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x,scrollShift*1.2,2,delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y,-scrollShift*.32,2,delta);
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x,pointer.current.x*.35,2,delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y,-pointer.current.y*.25,2,delta);
    state.camera.lookAt(0,0,0);
  });
  const shellMat = <meshPhysicalMaterial color={magenta} roughness={.3} metalness={.05} clearcoat={.58} clearcoatRoughness={.25} sheen={.35} sheenColor={pink} />;
  return <Float speed={reducedMotion?0:1.1} rotationIntensity={reducedMotion?0:.08} floatIntensity={reducedMotion?0:.18}>
    <group ref={group} scale={1} onClick={() => exploded && onHotspot(null)}>
      <group ref={left}>
        <mesh scale={[.66,1.28,.78]} castShadow receiveShadow>{/* procedural half */}<sphereGeometry args={[1,48,48]} />{shellMat}</mesh>
        <LeafFins split={-1}/>{exploded && <Seeds side={1}/>} 
      </group>
      <group ref={right}>
        <mesh scale={[.66,1.28,.78]} castShadow receiveShadow><sphereGeometry args={[1,48,48]} />{shellMat}</mesh>
        <LeafFins split={1}/>{exploded && <Seeds side={-1}/>} 
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
  return <Canvas shadows dpr={[1, typeof window!=="undefined"&&innerWidth<768?1.25:1.65]} frameloop={visible&&!props.reducedMotion?"always":"demand"} gl={{antialias:true,alpha:true,powerPreference:"high-performance"}}>
    <PerspectiveCamera makeDefault position={[0,0,5.6]} fov={38}/>
    <color attach="background" args={["#172124"]}/><fog attach="fog" args={["#172124",7,13]}/>
    <ambientLight intensity={.65}/><directionalLight castShadow position={[4,6,4]} intensity={3.2} color="#fff5e8" shadow-mapSize={[1024,1024]}/><spotLight position={[-4,2,3]} intensity={6} angle={.55} penumbra={1} color="#ff3e8a"/><pointLight position={[0,-2,2]} intensity={2} color="#39734a"/>
    <Suspense fallback={null}><Fruit {...props}/><Foliage/><Sparkles count={props.reducedMotion?0:45} scale={[8,5,5]} size={1.6} speed={.12} color="#ff9ac3" opacity={.3}/><ContactShadows position={[0,-2.2,0]} opacity={.55} scale={7} blur={2.8} far={4}/></Suspense>
    <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI*.32} maxPolarAngle={Math.PI*.68} rotateSpeed={.45}/>
  </Canvas>;
}
