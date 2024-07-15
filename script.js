class Planet {
    constructor(game){
        this.game= game;
        this.x = this.game.width*0.5;
        this.y =this.game.height*0.5;
        this.radius = 80;
        this.image = document.getElementById('planet');

    }
    draw(context){

        context.drawImage(this.image, this.x-100, this.y-100)
        if(this.game.debug){
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            context.stroke();
        }
        
    }

}

class Player{
    constructor(game){
        this.game = game;
        this.x = this.game.width*0.5;
        this.y = this.game.height*0.5;
        this.radius=40;
        this.image = document.getElementById('player');
        this.aim;
        this.angle = Math.PI*0.5;
    }
    draw(context){
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(this.image, - this.radius, - this.radius);
        if(this.game.debug){
            context.beginPath();
            context.arc(0, 0, this.radius, 0, Math.PI*2);
            context.stroke();
        }
        
        context.restore();
    }
    update(){
        this.aim = this.game.calcAim( this.game.planet, this.game.mouse);
        this.x =this.game.planet.x+(this.radius+ this.game.planet.radius)* this.aim[0];
        this.y =this.game.planet.y +(this.radius+ this.game.planet.radius)* this.aim[1];
        this.angle = Math.atan2(this.aim[3],this.aim[2]);
    }
    shoot(){
        const projectile = this.game.getProjectile();
        if(projectile) projectile.start(this.x+ this.radius*this.aim[0],
            this.y+this.radius*this.aim[1],
            this.aim[0],this.aim[1]);
    }
}
class Projectile{
    constructor(game){
        this.game = game;
        this.x;
        this.y;
        this.radius = 5;
        this.speedX =-1;
        this.speedY=1;
        this.speedModiefier=5;
        this.free = true;

    }
    start(x,y, speedX, speedY){
        this.free = false;
        this.x = x;
        this.y=y;
        this.speedX= speedX* this.speedModiefier;
        this.speedY=speedY * this.speedModiefier;
    }
    reset(){
        this.free= true;
    }
    draw(context){
        if(!this.free){
            context.save();
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            context.fillStyle= 'gold';
            context.fill();
            context.restore();
        }
    }
    update(){
        if(!this.free){
            this.x += this.speedX;
            this.y += this.speedY;
        }
        if(this.x<0|| this.x> this.game.width||this.y<0||
            this.y>this.game.height){
                this.reset();
            }
    }

}
class Enemy{
     constructor(game){
        this.game=game;
        this.x=0;
        this.y=0;
        this.radius= 40;
        this.width= this.radius*2;
        this.height=this.radius*2;
        this.speedX=0;
        this.speedY=0;
        this.speedModiefier= Math.random()*0.5+0.1;
        this.angle=0;
        this.collided = false; 
        this.free= true;
     }

     start(){
        this.free= false;
        this.collided = false;
        this.frameX= 0;
        this.lives= this.maxLives;
        this.frameY = Math.floor(Math.random()*4);
        if(Math.random()< 0.5){
            this.x = Math.random()* this.game.width;
            this.y = Math.random() < 0.5 ? -this.radius: this.game.height+this.radius;
        }else{
            this.x=Math.random() < 0.5 ? -this.radius: this.game.width +this.radius ;
            this.y = Math.random()* this.game.height;
        }
        
        const aim = this.game.calcAim(this, this.game.planet);
        this.speedX =aim[0]*this.speedModiefier ;
        this.speedY =aim[1]*this.speedModiefier ;
        this.angle = Math.atan2(aim[3], aim[2])+Math.PI*0.5;
     }
     reset(){
        this.free=true;
     }
     hit(damage){
        this.lives -= damage;
        if(this.lives >=1) this.frameX++;
     }
     draw(context){
        if(!this.free){
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image,this.frameX* this.width,this.frameY* this.height,this.width,this.height,
             -this.radius, -this.radius, this.width, this.height);
            if(this.game.debug){
                context.beginPath();
                context.arc(0, 0, this.radius, 0, Math.PI*2);
                context.stroke();
                context.fillText(this.lives, 0, 0);
            }
            context.restore();
        }
     }
     update(){
        if(!this.free){
            this.x+=this.speedX;
            this.y+=this.speedY;

            //collision w planet
            if(this.game.checkCollision(this, this.game.planet)
            && this.lives>=1){
                this.lives =0;
                this.speedX=0;
                this.speedY=0;
                this.collided = true;
                this.game.lives--;
            }
            //collision w space ship
            if(this.game.checkCollision(this, this.game.player)
            && this.lives>=1){
                this.lives =0;
                this.collided = true;
                this.game.lives--;

            }
            //collision w bullet
            this.game.projectilePool.forEach(projectile => {
                if(!projectile.free && this.game.checkCollision(this,projectile)
                && this.lives>=1){
                    projectile.reset();
                    this.hit(1);
                }
            });
            if(this.lives<1 && this.game.spriteUpdate){
                this.frameX++;
            }
            if(this.frameX > this.maxFrame){
                this.reset();
                if(!this.collided)this.game.score += this.maxLives;
            }
        }
        //sprite logic
        
     }
}
class Asteroid extends Enemy{
    constructor(game){
        super(game);
        this.image = document.getElementById('asteroid');
        this.frameX=0;
        this.frameY = Math.floor(Math.random()*4);
        this.maxFrame=7;
        this.lives = 1;
        this.maxLives= this.lives;
    }

}
class Lobster extends Enemy{
    constructor(game){
        super(game);
        this.image = document.getElementById('lobster');
        this.frameX=0;
        this.frameY = Math.floor(Math.random()*4);
        this.maxFrame=14;
        this.lives = 8;
        this.maxLives= this.lives;
    }

}
class Rhino extends Enemy{
    constructor(game){
        super(game);
        this.image = document.getElementById('rhino');
        this.frameX=0;
        this.frameY = Math.floor(Math.random()*4);
        this.maxFrame=6;
        this.lives = 4;
        this.maxLives= this.lives;
    }

}
class Beetle extends Enemy{
    constructor(game){
        super(game);
        this.image = document.getElementById('beetle');
        this.frameX=0;
        this.frameY = Math.floor(Math.random()*4);
        this.maxFrame=3;
        this.lives = 1;
        this.maxLives= this.lives;
    }

}
class Game{
    constructor(canvas){
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height= this.canvas.height;
        this.planet = new Planet(this);
        this.player = new Player(this);
        this.debug = false;

        this.projectilePool = [];
        this.numProjectiles = 25;
        this.createprojectilePool();

        this.enemyPool=[];
        this.numEnemies =20;
        this.createEnemyPool();
        this.enemyPool[0].start();
        this.enemyTimer= 0;
        this.enemyInterval= 1000;

        this.spriteUpdate = false;
        this.spriteTimer = 0;
        this.spriteInterval = 150;
        this.score= 0;
        this.winningScore= 100;
        this.lives= 5;

        this.mouse ={
            x: 0,
            y: 0
        }


        

        //event listeners

        window.addEventListener('mousemove', e => {
            this.mouse.x =e.offsetX;
            this.mouse.y = e.offsetY;
        });
        window.addEventListener('mousedown', e =>{
            this.mouse.x =e.offsetX;
            this.mouse.y = e.offsetY;
            this.player.shoot();
        })

        window.addEventListener('keyup', e =>{
            if(e.key === 'd') this.debug = !this.debug;
        })
    }
    render(context, deltaTime){
        
        this.planet.draw(context);
        this.player.draw(context);
        this.drawText(context);
        this.player.update();

        this.projectilePool.forEach(projectile => {
            projectile.draw(context);
            projectile.update();
        });      
        this.enemyPool.forEach(enemy => {
            enemy.draw(context);
            enemy.update();
        });
        //add enemies periodically&automatically
        if(!this.gameOver){
            if(this.enemyTimer < this.enemyInterval){
                this.enemyTimer += deltaTime;
            }else {
                this.enemyTimer = 0;
                const enemy = this.getEnemy();
                if(enemy) enemy.start();
            }
            // update sprites
            if(this.spriteTimer <this.spriteInterval){
                this.spriteTimer+= deltaTime;
                this.spriteUpdate = false;
            }else{
                this.spriteTimer=0;
                this.spriteUpdate=true;
            }
        }
        
        //win/lose logic
        if(this.score>= this.winningScore || this.lives<1){
            this.gameOver = true;

        }
    
    }
    drawText(context){
        context.save();
        context.textAlign ='center';
        context.font ='30px Impact';
        context.fillText('score: '+this.score ,60,100);
        for(let i=0; i<this.lives; i++){
            context.fillRect(30+15*i, 130,10,30);
        }
        if(this.gameOver){
            context.textAlign ='center';
            let message1;
            let message2;
            if(this.score >= this.winningScore){
                message1= 'Winner!'
                message2= 'Your score is: ' + this.score +'1';
            }else{
                message1= 'You lose!';
                message2= 'Try again!';
            }
            context.font = '100px Impact';
            context.fillText(message1, this.width*0.5,200);
            context.font= '50px Impact';
            context.fillText(message2, this.width*0.5, 550);
        }
        context.restore();

    }
    calcAim(a, b){
        const dx= a.x -b.x;
        const dy =a.y -b.y;
        const distance = Math.hypot(dx,dy);
        const aimX = dx/distance*-1;
        const aimY = dy/distance*-1;
        return[aimX, aimY, dx, dy];
    }
    checkCollision(a,b){
        const dx = a.x- b.x;
        const dy = a.y -b.y;
        const distance = Math.hypot(dx,dy);
        const sumOfR =a.radius + b.radius;
        return distance < sumOfR;
    }
    createprojectilePool(){
        for(let i=0; i<this.numProjectiles; i++){
            this.projectilePool.push(new Projectile(this));
        }
    }
    getProjectile(){
        for(let i=0; i<this.numProjectiles; i++){
            if(this.projectilePool[i].free) return this.projectilePool[i];
        }
    }
    createEnemyPool(){
        for(let i=0; i<this.numEnemies; i++){
            let randomNumber = Math.random();
            if(randomNumber<0.25){
                this.enemyPool.push(new Lobster(this));
            }else if(randomNumber<0.5){
                this.enemyPool.push(new Asteroid(this));
            }else if(randomNumber<0.75){
                this.enemyPool.push(new Beetle(this));
            }else{
                this.enemyPool.push(new Rhino(this));
            }

        }
    }
    getEnemy(){
        for(let i=0; i<this.enemyPool.length; i++){
            if(this.enemyPool[i].free) return this.enemyPool[i];
        }
    }
}


window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const c = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height= 800;
    c.strokeStyle = 'white';
    c.lineWidth = 2;
    c.font ='50px Helvetica';
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    const game = new Game(canvas);
    game.render(c);
    let lastTime=0;
    function animate(timeStamp){
        const deltaTime=timeStamp - lastTime;
        lastTime = timeStamp;
        c.clearRect(0,0, canvas.width, canvas.height);
        game.render(c, deltaTime);        
        requestAnimationFrame(animate);

    }

    animate();
});