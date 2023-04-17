console.clear();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(55, 1, 1, 1000);
camera.position.set(0, 0, 200);
var renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setClearColor(0x202020);
var canvas = renderer.domElement;
document.body.appendChild(canvas);

var controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true;

var light = new THREE.DirectionalLight(0xffffff, 1);
light.position.setScalar(100);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

var size = { x: 200, z: 200 };
var radius = 100;
var pointsCount = 250;
var counter = 0;
var points2d = [];
var temp = new THREE.Vector2();
while (counter < pointsCount) {
  temp.random().subScalar(0.5).multiplyScalar(radius * 2);
  if(temp.length() < radius){
    points2d.push({x:temp.x, y:temp.y});
    counter++;
  }
}

var geom = new THREE.BufferGeometry().setFromPoints(points2d);
var cloud = new THREE.Points(
  geom,
  new THREE.PointsMaterial({ 
    color: 0x99ccff, 
    size: 2,
    onBeforeCompile: shader => {
      console.log(shader.fragmentShader);
      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <clipping_planes_fragment>`,
        `
          if (length(gl_PointCoord - 0.5) > 0.5) discard;
          
        #include <clipping_planes_fragment>`
      );
    }
  })
);
scene.add(cloud);

var voronoi = new Voronoi();
var bbox = {xl: -radius, xr: radius, yt: -radius, yb: radius};
var diagram = voronoi.compute(points2d, bbox);
console.log(diagram.cells[0]);

let vCells = [];
let lineHolder = new THREE.Group();
let cellHolder = new THREE.Group();
scene.add(lineHolder, cellHolder);
diagram.cells.forEach( cell => {
  let cellData = processCell(cell, radius);
  if (cellData.isInside){
    buildTestContour(cellData);
    buildHull(cellData, 10, 2);
  }
})

var gui = new dat.GUI();
gui.add(cloud, "visible").name("points");
gui.add(lineHolder, "visible").name("lines");
gui.add(cellHolder, "visible").name("cells");

let clock = new THREE.Clock();

render();

function resize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function render() {
  if (resize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  
  let t = clock.getElapsedTime();
  
  controls.update();
  
  vCells.forEach( c => {
    let phase = c.userData.initPhase + t;
    let s = Math.sin(phase) * 0.5 + 0.5;
    let scale = 0.1 + s * 0.9;
    c.scale.setScalar(scale);
  })
  
  light.position.x = Math.cos(t) * 100;
  light.position.y = Math.sin(t) * 100;
  
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function buildHull(cd, height, lidShift){
  
  let basePoints = [
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3()
  ]
  
  let geomPoints = [];
  
  for(let i = 0; i < cd.edgesCount; i++){
    basePoints[0].set(0, 0, 0);
    basePoints[1].copy(cd.centeredPoints[i * 2 + 0]);
    basePoints[2].copy(cd.centeredPoints[i * 2 + 1]);
    
    if (isClockWise(basePoints)){
      basePoints[1].copy(cd.centeredPoints[i * 2 + 1]);
      basePoints[2].copy(cd.centeredPoints[i * 2 + 0]);
    }
    
    // segment parts (top lid, bottom lid, side)
    geomPoints.push(
      // top lid
      basePoints[0].clone().setZ(height + lidShift),
      basePoints[1].clone().setZ(height),
      basePoints[2].clone().setZ(height),
      // bottom lid
      basePoints[0].clone().setZ(-lidShift),
      basePoints[2].clone(),
      basePoints[1].clone(),
      // side
      basePoints[2].clone().setZ(height),
      basePoints[1].clone().setZ(height),
      basePoints[2].clone(),
     
      basePoints[2].clone(),
      basePoints[1].clone().setZ(height),
      basePoints[1].clone()

    )
  }

  let g = new THREE.BufferGeometry().setFromPoints(geomPoints);
  g.computeVertexNormals();
  let m = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff});
  let o = new THREE.Mesh(g, m);
  o.position.copy(cd.center);
  o.userData = {
    initPhase: Math.random() * Math.PI * 2
  }
  cellHolder.add(o)
  vCells.push(o);
  
}

function buildTestContour(cd){
  let g = new THREE.BufferGeometry().setFromPoints(cd.contourPoints);
  let m = new THREE.LineBasicMaterial({color: "yellow"});
  let l = new THREE.LineSegments(g, m);
  lineHolder.add(l);
}

function processCell(cell, radius){
  let res = false;
  let maxVal = 0;
  let contourPoints = [];
  cell.halfedges.forEach(he => {
    let a = he.edge.va;
    let b = he.edge.vb;
    let val = Math.max( Math.hypot(a.x, a.y), Math.hypot(b.x, b.y) );
    maxVal = Math.max(maxVal, val);
    contourPoints.push(a, b);
  });
  let center = new THREE.Vector3(cell.site.x, cell.site.y, 0);
  let basePoints = contourPoints.map( cp => {return new THREE.Vector3(cp.x, cp.y, 0)});
  let centeredPoints = basePoints.map( bp => {return bp.clone().sub(center)});
  return {
    center: center,
    contourPoints: basePoints,
    centeredPoints: centeredPoints,
    edgesCount: cell.halfedges.length,
    isInside: maxVal <= radius
  }
}

function area( contour ) {

  const n = contour.length;
  let a = 0.0;

  for ( let p = n - 1, q = 0; q < n; p = q ++ ) {

    a += contour[ p ].x * contour[ q ].y - contour[ q ].x * contour[ p ].y;

  }

  return a * 0.5;

}

function isClockWise( pts ) {

  return area( pts ) < 0;

}