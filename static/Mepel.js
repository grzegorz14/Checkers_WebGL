export default class Mepel extends THREE.Mesh {
    constructor(id, color, row, column) {
        super() 
        this.geometry = new THREE.CylinderGeometry(20, 20, 10, 30)
        this.texture = color == 1 ? 'https://i.imgur.com/o4zZcGW.png' : 'https://i.imgur.com/7GJw4NQ.png'
        this.material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load(this.texture)
        })
        this.row = row
        this.column = column
        this.mepelId = id
        this.color = color
        this.isSelected = false
        this.type = "normal"
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