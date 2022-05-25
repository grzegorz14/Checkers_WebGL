export default class Item extends THREE.Mesh {
    constructor(row, column) {
        super()
        this.geometry = new THREE.BoxGeometry(50, 18, 50);
        this.material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('https://i.imgur.com/GBQ4ZZL.png')
        })
        this.row = row
        this.column = column
        this.killId = -1
        this.isHighlighted = false
    }

    highlighted = (bool) => {
        this.isHighlighted = bool
        this.material = new THREE.MeshBasicMaterial({
            color: bool ? 0xaaffff : 0xffffff,
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load('https://i.imgur.com/GBQ4ZZL.png')
        })
    }
}
