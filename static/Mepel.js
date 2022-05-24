class Mepel extends THREE.Mesh {
    constructor(color) {
        super() // constructor call from Mesh - inherited class
        this.geometry = new THREE.CylinderGeometry(20, 20, 10, 30)
        this.texture = color == "white" ? './textures/whitePawn.png' : './textures/redPawn.png'
        this.material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load(this.texture)
        })
        this.row = 0
        this.column = 0
        this.mepelId = 0
        this.color = color == "white" ? 1 : 2
        this.isSelected = false
        this.type = "normal"
    }

    get positionX() {
        return this.position.x
    }
    get positionY() {
        return this.position.y
    }
    get positionZ() {
        return this.position.z
    }
    set positionX(value) {
        this.position.x = value
    }
    set positionY(value) {
        this.position.y = value
    }
    set positionZ(value) {
        this.position.z = value
    }

    selected = (bool) => {
        this.isSelected = bool
        if (this.type == "queen") {
            this.material = new THREE.MeshBasicMaterial({
                color: this.color == 1 ? (bool ? 0xaaaaff : 0x66aaff) : (bool ? 0x66aaff : 0x66ffff),
                side: THREE.DoubleSide,
                map: new THREE.TextureLoader().load(this.texture)
            })
        }
        else {
            this.material = new THREE.MeshBasicMaterial({
                color: bool ? 0xaaffff : 0xffffff,
                side: THREE.DoubleSide,
                map: new THREE.TextureLoader().load(this.texture)
            })
        }
    }

    becomeQueen = () => {
        this.type = "queen"
        this.material = new THREE.MeshBasicMaterial({
            color: this.color == 1 ? 0x66aaff : 0x66ffff,
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load(this.texture)
        })
    }
}

export default Mepel