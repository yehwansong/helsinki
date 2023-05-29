var isMobile = false;
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(35, 1, 1, 1000);
    camera.position.set(0, -200, 200);
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
var pointsCount = 100;
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
      shader.fragmentShader = shader.fragmentShader.replace(
      );
    }
  })
);
scene.add(cloud);

var voronoi = new Voronoi();
var bbox = {xl: -radius, xr: radius, yt: -radius, yb: radius};
var diagram = voronoi.compute(points2d, bbox);

let vCells = [];
let lineHolder = new THREE.Group();
let cellHolder = new THREE.Group();
scene.add(lineHolder, cellHolder);
diagram.cells.forEach( cell => {
  let cellData = processCell(cell, radius);
  if (cellData.isInside){
    buildTestContour(cellData);
    console.log(cellData)
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
  
  // vCells.forEach( c => {
  //   let phase = c.userData.initPhase + t;
  //   let s = Math.sin(phase) * 0.5 + 0.5;
  //   let scale = 0.1 + s * 0.9;
  //   c.scale.setScalar(scale);
  // })
  
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
        // basePoints[0].clone().setZ(height + lidShift),
        // basePoints[1].clone().setZ(height),
        // basePoints[2].clone().setZ(height),
        // // bottom lid
        // basePoints[0].clone().setZ(-lidShift),
        // basePoints[2].clone(),
        // basePoints[1].clone(),
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
console.log(geomPoints)
var indexDelaunay = Delaunator.from(geomPoints.map(v => { return [v.x, v.z]; }) );
console.log(indexDelaunay)
var meshIndex = [], quad_uvs = [];
for(var i = 0; i < indexDelaunay.triangles.length; i++){ meshIndex.push(indexDelaunay.triangles[i]); }
        
   for(var j = 0; j < geomPoints.length; j++){


    var qx = remapFloat(geomPoints[j].x, -100, 100, 1, 0);
    var qz = remapFloat(geomPoints[j].z, -100, 100, 0, 1);

    quad_uvs.push(...[qx, qz]);

}
    
uvs = new Float32Array(quad_uvs);
g.setAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
// g.setIndex(meshIndex);

g.computeVertexNormals();
let texture = new THREE.TextureLoader().load( 'img_1947-10.jpg' )
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
        let m = new THREE.MeshBasicMaterial( {
            map: texture,
            side: THREE.DoubleSide
        } );


    // let m = new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff});
    let o = new THREE.Mesh(g, m);
    o.scale.set(0.9,0.9,0.9)
    o.position.copy(cd.center);
    o.userData = {
        initPhase: Math.random() * Math.PI * 2
    }
    console.log(cellHolder)
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
function remapFloat(v_, min0_, max0_, min1_, max1_) { return min1_ + (v_ - min0_) / (max0_ - min0_) * (max1_ - min1_); }
function isClockWise( pts ) {

  return area( pts ) < 0;

}