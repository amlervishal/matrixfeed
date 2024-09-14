import React, { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';

const ASCII_CHARS = '@%#*+=-:. '.split('');
const WIDTH = 150;
const HEIGHT = 90;

const styles = {
  glowText: {
    textShadow: '0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00'
  },
  glowButton: {
    boxShadow: '0 0 5px #00ff00, 0 0 10px #00ff00',
    textShadow: '0 0 5px #00ff00'
  },
  asciiArt: {
    textShadow: '0 0 5px #00ff00'
  }
};

const ASCIICamera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const asciiContainerRef = useRef(null);
  const [asciiArt, setAsciiArt] = useState('');

  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Error accessing the camera:', error);
      }
    };

    const convertToASCII = () => {
      ctx.drawImage(videoRef.current, 0, 0, WIDTH, HEIGHT);
      const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
      let result = '';

      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const offset = (y * WIDTH + x) * 4;
          const brightness = (imageData.data[offset] + imageData.data[offset + 1] + imageData.data[offset + 2]) / 3;
          const charIndex = Math.floor(brightness / 255 * (ASCII_CHARS.length - 1));
          result += ASCII_CHARS[charIndex];
        }
        result += '\n';
      }

      setAsciiArt(result);
    };

    const updateASCII = () => {
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        convertToASCII();
      }
      animationFrameId = requestAnimationFrame(updateASCII);
    };

    setupCamera();
    updateASCII();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takeSnapshot = () => {
    if (asciiContainerRef.current) {
      html2canvas(asciiContainerRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'matrix-wonderland-snapshot.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const saveAsciiArt = () => {
    const blob = new Blob([asciiArt], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = 'matrix-wonderland-ascii.txt';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      <nav className="w-full py-4 bg-black border-b border-green-500">
        <h1 className="text-green-500 text-xl sm:text-2xl md:text-3xl font-mono text-center animate-pulse" style={styles.glowText}>
          into the matrix..
        </h1>
      </nav>
      <div className="w-11/12 sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-3/5 flex-grow flex flex-col justify-center items-center my-4">
        <div 
          ref={asciiContainerRef}
          className="w-full overflow-hidden bg-black p-4"
        >
          <pre 
            className="ascii-art text-green-500 whitespace-pre font-mono text-center"
            style={{
              ...styles.asciiArt,
              fontSize: 'clamp(0.2rem, 1vw, 0.35rem)',
              lineHeight: 'clamp(0.3rem, 1.2vw, 0.45rem)',
              letterSpacing: 'clamp(0.05rem, 0.2vw, 0.08rem)',
            }}
          >
            {asciiArt}
          </pre>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <button 
            onClick={takeSnapshot} 
            className="bg-black text-green-500 border border-green-500 px-4 py-2 font-mono hover:bg-green-500 hover:text-black transition-colors duration-300"
            style={styles.glowButton}
          >
            Capture Image
          </button>
          <button 
            onClick={saveAsciiArt} 
            className="bg-black text-green-500 border border-green-500 px-4 py-2 font-mono hover:bg-green-500 hover:text-black transition-colors duration-300"
            style={styles.glowButton}
          >
            Save ASCII
          </button>
        </div>
      </div>
      <div>
      <p className="text-green-500 text-xs sm:text-sm md:text-base font-mono text-center animate-pulse" style={styles.glowText}>
          project by va © 2024
        </p>
      </div>
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="hidden" />
    </div>
  );
};

export default ASCIICamera;