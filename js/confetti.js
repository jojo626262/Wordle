function triggerConfetti() {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1000";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const colors = ["#6aaa64", "#c9b458", "#e07a5f", "#3d84a8", "#f4a261"];

    const particles = [];
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * canvas.height * 0.5,
            size: 6 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: 2 + Math.random() * 3,
            speedX: -2 + Math.random() * 4,
            rotation: Math.random() * 360,
            rotationSpeed: -6 + Math.random() * 12,
        });
    }

    const duration = 2500;
    const start = performance.now();

    function frame(now) {
        const elapsed = now - start;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of particles) {
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        }

        if (elapsed < duration) {
            requestAnimationFrame(frame);
        } else {
            canvas.remove();
        }
    }

    requestAnimationFrame(frame);
}
