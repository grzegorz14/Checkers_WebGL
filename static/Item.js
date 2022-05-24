class Item extends THREE.Mesh {
    constructor() {
        super() // constructor call from Mesh - inherited class
        this.geometry = new THREE.BoxGeometry(50, 18, 50);
        this.material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('./textures/darkWood.png')
        })
        this.row = 0
        this.column = 0
        this.killId = -1
        this.isHighlighted = false
    }

    get positionX() {
        return this.position.x
    }
    get positionZ() {
        return this.position.z
    }

    highlighted = (bool) => {
        this.isHighlighted = bool
        this.material = new THREE.MeshBasicMaterial({
            color: bool ? 0xaaffff : 0xffffff,
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('./textures/darkWood.png')
        })
    }
}

export default Item