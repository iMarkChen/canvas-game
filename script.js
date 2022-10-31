window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1')
    const ctx = canvas.getContext('2d')
    canvas.width = 1000
    canvas.height = 600
    let enemise = []
    let score = 0
    let gameOver = false
    class InputHandler {
        constructor() {
            this.keys = []
            window.addEventListener('keydown', e => {
                if (
                    !this.keys.includes(e.key) &&
                    (e.key === 'ArrowDown' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight')
                ) {
                    this.keys.push(e.key)
                }
            })
            window.addEventListener('keyup', e => {
                if (
                    e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight'
                ) {
                    this.keys.splice(this.keys.indexOf(e.key), 1)
                }
            })
        }
    }

    class Player {
        constructor(gameWdith, gameHeight) {
            this.gameHeight = gameHeight
            this.gameWdith = gameWdith
            this.width = 200
            this.height = 200
            this.x = 0
            this.y = this.gameHeight - this.height
            this.image = document.getElementById('playerImage')
            this.frameX = 0
            this.frameY = 0
            this.maxFrame = 8
            this.speed = 0
            this.vy = 0
            this.weight = 1
            this.fps = 20
            this.frameTimer = 0
            this.frameInterval = 1000 / this.fps
        }
        draw(context) {
            context.fillStyle = 'white'
            context.drawImage(
                this.image,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            )
        }
        update(input, deltaTime, enemise) {
            enemise.forEach(enemy => {
                const dx = enemy.x + enemy.width / 2 - 20 - (this.x + this.width / 2)
                const dy = enemy.y + enemy.height / 2 + 40 - (this.y + this.height / 2)
                const distance = Math.sqrt(dx * dx + dy * dy)
                if (distance < enemy.width / 2 + this.width / 2) {
                    gameOver = true
                }
            })
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) {
                    this.frameX = 0
                } else {
                    this.frameX++
                }
                this.frameTimer = 0
            } else {
                this.frameTimer += deltaTime
            }

            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5
            } else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
                this.vy -= 28
            } else {
                this.speed = 0
            }
            // 水平移动
            this.x += this.speed
            if (this.x < 0) {
                this.x = 0
            } else if (this.x > this.gameWdith - this.width) {
                this.x = this.gameWdith - this.width
            }
            // 垂直移动
            this.y += this.vy
            if (!this.onGround()) {
                this.vy += this.weight
                this.maxFrame = 6
                this.frameY = 1
            } else {
                this.vy = 0
                this.maxFrame = 8
                this.frameY = 0
            }
            if (this.y > this.gameHeight - this.height) {
                this.y = this.gameHeight - this.height
            }
        }
        onGround() {
            return this.y >= this.gameHeight - this.height
        }
    }

    class Enemy {
        constructor(gameWdith, gameHeight) {
            this.gameWdith = gameWdith
            this.gameHeight = gameHeight
            this.image = document.getElementById('enemyImage')
            this.width = 160
            this.height = 119
            this.x = this.gameWdith
            this.y = this.gameHeight - this.height
            this.frameX = 0
            this.maxFrame = 5
            this.speed = 8
            this.fps = 10
            this.frameTimer = 0
            this.frameInterval = 1000 / this.fps
            this.markedForDeletion = false
        }
        draw(context) {
            context.drawImage(
                this.image,
                this.frameX * this.width,
                0,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            )
        }
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) {
                    this.frameX = 0
                } else {
                    this.frameX++
                }
                this.frameTimer = 0
            } else {
                this.frameTimer += deltaTime
            }
            this.x -= this.speed
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true
                score++
            }
        }
    }
    class Background {
        constructor(gameWdith, gameHeight) {
            this.gameWdith = gameWdith
            this.gameHeight = gameHeight
            this.image = document.getElementById('backgroundImage')
            this.x = 0
            this.y = 0
            this.width = 2400
            this.height = 720
            this.speed = 5
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height)
            context.drawImage(this.image, this.x + this.width - 1, this.y, this.width, this.height)
        }
        update() {
            this.x -= this.speed
            if (this.x < 0 - this.width) {
                this.x = 0
            }
        }
    }
    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemise.push(new Enemy(canvas.width, canvas.height))
            enemyTimer = 0
        } else {
            enemyTimer += deltaTime
        }
        enemise.forEach(enemy => {
            enemy.draw(ctx)
            enemy.update(deltaTime)
        })
        enemise = enemise.filter(enemy => !enemy.markedForDeletion)
    }
    function displayStatusText(context) {
        // 得分
        context.textAlign = 'left'
        context.font = '40px Helvetica'
        context.fillStyle = 'black'
        context.fillText(`得分: ${score}`, 20, 50)
        context.fillStyle = 'white'
        context.fillText(`得分: ${score}`, 22, 50)
        // 游戏提示
        context.textAlign = 'right'
        context.font = '20px Helvetica'
        context.fillStyle = 'black'
        context.fillText(`通过方向键移动和跳跃`, canvas.width - 10, 30)
        context.fillStyle = 'white'
        context.fillText(`通过方向键移动和跳跃`, canvas.width - 8, 30)
        if (gameOver) {
            context.textAlign = 'center'
            context.font = '50px Helvetica'
            context.fillStyle = 'black'
            context.fillText(`游戏结束`, canvas.width / 2, 200)
            context.fillStyle = 'white'
            context.fillText(`游戏结束`, canvas.width / 2 + 2, 200 + 2)
            context.font = '30px Helvetica'
            context.fillStyle = 'black'
            context.fillText(`刷新页面重试`, canvas.width / 2, 200 + 50)
            context.fillStyle = 'white'
            context.fillText(`刷新页面重试`, canvas.width / 2 + 2, 200 + 2 + 50)
        }
    }

    const input = new InputHandler()
    const player = new Player(canvas.width, canvas.height)
    const background = new Background(canvas.width, canvas.height)

    let lastTime = 0
    let enemyTimer = 0
    let enemyInterval = 1000
    let randomEnemyInterval = Math.random() * 1000 + 500

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        background.draw(ctx)
        background.update()
        player.draw(ctx)
        player.update(input, deltaTime, enemise)
        handleEnemies(deltaTime)
        displayStatusText(ctx)
        if (!gameOver) requestAnimationFrame(animate)
    }
    animate(0)
})
