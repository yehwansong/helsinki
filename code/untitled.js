
function buildHull(){

    let basePoints = [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
    ]
      
    let geomPoints = [];
      for (var k = polygons.length - 1; k >= 0; k--) {
        for(let i = 0; i < polygons[k].length; i++){
            basePoints[0].set(0, 0, 0);
            basePoints[1].copy(polygons[k][i + 0]);
            basePoints[2].copy(polygons[k][i + 1]);
        
            
            geomPoints.push(
                basePoints[2].clone().setZ(height),
                basePoints[1].clone().setZ(height),
                basePoints[2].clone(),

                basePoints[2].clone(),
                basePoints[1].clone().setZ(height),
                basePoints[1].clone()

            )
        }
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
    cellHolder.add(o)
    vCells.push(o);
  
}