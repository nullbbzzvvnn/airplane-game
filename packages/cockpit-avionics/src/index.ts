import * as THREE from 'three';

export interface FlightData {
  airspeed: number;
  altitude: number;
  heading: number;
  pitch: number;
  roll: number;
  verticalSpeed: number;
  n1: number;
  n2: number;
  egt: number;
  fuelFlow: number;
  oilPressure: number;
  latitude: number;
  longitude: number;
}

/**
 * Primary Flight Display (PFD)
 * Renders artificial horizon, airspeed/altitude tapes, VSI
 */
export class PrimaryFlightDisplay {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private material: THREE.MeshBasicMaterial;
  private mesh: THREE.Mesh;

  constructor(width: number = 1024, height: number = 768) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.material = new THREE.MeshBasicMaterial({ map: this.texture });
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width / 100, height / 100),
      this.material
    );
  }

  render(data: FlightData) {
    this.ctx.fillStyle = '#0a0e27';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawArtificialHorizon(data);
    this.drawAirspeedTape(data);
    this.drawAltitudeTape(data);
    this.drawVerticalSpeedIndicator(data);
    this.drawHeadingIndicator(data);
    this.drawTurnCoordinator(data);

    this.texture.needsUpdate = true;
  }

  private drawArtificialHorizon(data: FlightData) {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const size = 300;

    // Sky gradient
    const skyGradient = this.ctx.createLinearGradient(
      0,
      cy - size * Math.sin(data.pitch * Math.PI / 180),
      0,
      cy + size
    );
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#8B4513');

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate((data.roll * Math.PI) / 180);

    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(-size, -size, size * 2, size * 2);

    // Pitch ladder
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    for (let pitch = -90; pitch <= 90; pitch += 10) {
      const y = (pitch - data.pitch) * 2;
      if (Math.abs(y) > size) continue;

      if (pitch % 30 === 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(-80, y);
        this.ctx.lineTo(80, y);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(pitch.toString(), -100, y + 5);
      } else if (pitch % 10 === 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(-40, y);
        this.ctx.lineTo(40, y);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();

    // Slip/skid indicator
    this.ctx.strokeStyle = '#ff6600';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(cx + data.roll * 2, cy - 150, 10, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  private drawAirspeedTape(data: FlightData) {
    const x = 100;
    const cy = this.canvas.height / 2;
    const tapeHeight = 400;

    this.ctx.fillStyle = '#1a1f3a';
    this.ctx.fillRect(x - 40, cy - tapeHeight / 2, 80, tapeHeight);

    // Speed markings
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';

    for (let speed = 0; speed <= 500; speed += 50) {
      const offset = (speed - data.airspeed) * 1.5;
      const y = cy + offset;

      if (Math.abs(offset) > tapeHeight / 2 + 50) continue;

      this.ctx.beginPath();
      this.ctx.moveTo(x - 10, y);
      this.ctx.lineTo(x + 10, y);
      this.ctx.stroke();

      if (speed % 100 === 0) {
        this.ctx.fillText(speed.toString(), x - 25, y + 4);
      }
    }

    // V-speed bugs
    const vSpeeds = [
      { speed: 140, label: 'V1', color: '#ff0000' },
      { speed: 150, label: 'VR', color: '#ff6600' },
      { speed: 160, label: 'V2', color: '#ffff00' },
      { speed: 250, label: 'VNE', color: '#ff0000' },
    ];

    vSpeeds.forEach(v => {
      const y = cy + (v.speed - data.airspeed) * 1.5;
      this.ctx.fillStyle = v.color;
      this.ctx.fillRect(x - 35, y - 3, 10, 6);
      this.ctx.fillText(v.label, x + 20, y + 3);
    });
  }

  private drawAltitudeTape(data: FlightData) {
    const x = this.canvas.width - 100;
    const cy = this.canvas.height / 2;
    const tapeHeight = 400;

    this.ctx.fillStyle = '#1a1f3a';
    this.ctx.fillRect(x - 40, cy - tapeHeight / 2, 80, tapeHeight);

    this.ctx.strokeStyle = '#00ff00';
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';

    for (let alt = 0; alt <= 30000; alt += 500) {
      const offset = (alt - data.altitude) * 0.05;
      const y = cy + offset;

      if (Math.abs(offset) > tapeHeight / 2 + 50) continue;

      this.ctx.beginPath();
      this.ctx.moveTo(x - 10, y);
      this.ctx.lineTo(x + 10, y);
      this.ctx.stroke();

      if (alt % 1000 === 0) {
        this.ctx.fillText((alt / 1000).toFixed(0), x + 25, y + 4);
      }
    }
  }

  private drawVerticalSpeedIndicator(data: FlightData) {
    const x = this.canvas.width - 80;
    const y = this.canvas.height - 120;
    const radius = 40;

    // Draw dial
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draw needle
    const angle = (data.verticalSpeed / 3000) * Math.PI - Math.PI / 2;
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + Math.cos(angle) * radius * 0.8, y + Math.sin(angle) * radius * 0.8);
    this.ctx.stroke();

    // Value
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${Math.round(data.verticalSpeed)} fpm`, x, y + radius + 30);
  }

  private drawHeadingIndicator(data: FlightData) {
    const x = this.canvas.width / 2;
    const y = this.canvas.height - 80;
    const radius = 60;

    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate((-data.heading * Math.PI) / 180);

    // Heading card
    this.ctx.fillStyle = '#1a1f3a';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Heading marks
    this.ctx.strokeStyle = '#00ff00';
    for (let h = 0; h < 360; h += 10) {
      const angle = (h * Math.PI) / 180;
      this.ctx.beginPath();
      this.ctx.moveTo(
        Math.cos(angle) * radius * 0.9,
        Math.sin(angle) * radius * 0.9
      );
      this.ctx.lineTo(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
      this.ctx.stroke();
    }

    this.ctx.restore();

    // Heading bug and course
    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - radius - 10);
    this.ctx.lineTo(x - 10, y - radius);
    this.ctx.lineTo(x + 10, y - radius);
    this.ctx.fill();

    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      Math.round(data.heading).toString().padStart(3, '0'),
      x,
      y + radius + 30
    );
  }

  private drawTurnCoordinator(data: FlightData) {
    const x = 100;
    const y = this.canvas.height - 100;
    const size = 50;

    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x - size, y - size, size * 2, size * 2);

    // Draw airplane symbol
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(x - 5, y - 20, 10, 10);
    this.ctx.fillRect(x - 20, y + 5, 40, 5);
  }

  getMesh(): THREE.Mesh {
    return this.mesh;
  }
}

/**
 * Navigation Display (ND)
 * ARC, ROSE, and NAV modes with flight plan display
 */
export class NavigationDisplay {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private material: THREE.MeshBasicMaterial;
  private mesh: THREE.Mesh;

  constructor(width: number = 1024, height: number = 768) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.material = new THREE.MeshBasicMaterial({ map: this.texture });
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width / 100, height / 100),
      this.material
    );
  }

  render(data: FlightData, mode: 'ARC' | 'ROSE' | 'NAV' = 'ARC') {
    this.ctx.fillStyle = '#0a0e27';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    switch (mode) {
      case 'ARC':
        this.drawARCMode(cx, cy, data);
        break;
      case 'ROSE':
        this.drawROSEMode(cx, cy, data);
        break;
      case 'NAV':
        this.drawNAVMode(cx, cy, data);
        break;
    }

    this.texture.needsUpdate = true;
  }

  private drawARCMode(cx: number, cy: number, data: FlightData) {
    // Heading arc
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;

    // Draw arc (60° field of view)
    const radius = 200;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI, true);
    this.ctx.stroke();

    // Heading marks
    for (let h = Math.floor(data.heading) - 30; h <= Math.floor(data.heading) + 30; h += 5) {
      const hNorm = ((h % 360) + 360) % 360;
      const relHeading = hNorm - data.heading;
      if (Math.abs(relHeading) > 30) continue;

      const angle = ((90 - relHeading) * Math.PI) / 180;
      const x1 = cx + Math.cos(angle) * radius * 0.8;
      const y1 = cy + Math.sin(angle) * radius * 0.8;
      const x2 = cx + Math.cos(angle) * radius;
      const y2 = cy + Math.sin(angle) * radius;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }

    // Aircraft symbol
    this.ctx.fillStyle = '#00ff00';
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - 30);
    this.ctx.lineTo(cx - 15, cy + 15);
    this.ctx.lineTo(cx + 15, cy + 15);
    this.ctx.fill();
  }

  private drawROSEMode(cx: number, cy: number, data: FlightData) {
    // Compass rose with heading up
    const radius = 200;
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.fillStyle = '#00ff00';

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate((-data.heading * Math.PI) / 180);

    // Draw circle
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Cardinal directions
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('N', 0, -radius - 20);
    this.ctx.fillText('E', radius + 20, 0);
    this.ctx.fillText('S', 0, radius + 30);
    this.ctx.fillText('W', -radius - 20, 0);

    this.ctx.restore();

    // Aircraft symbol (always at center, nose up)
    this.ctx.fillStyle = '#00ff00';
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - 30);
    this.ctx.lineTo(cx - 15, cy + 15);
    this.ctx.lineTo(cx + 15, cy + 15);
    this.ctx.fill();
  }

  private drawNAVMode(cx: number, cy: number, data: FlightData) {
    // Navigation/weather radar mode
    const radius = 200;

    this.ctx.strokeStyle = '#00ff00';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Range rings
    for (let i = 1; i < 5; i++) {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, (radius * i) / 4, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Waypoints (example)
    const waypoints = [
      { lat: 0.01, lon: 0.02, name: 'WPT1' },
      { lat: 0.03, lon: -0.01, name: 'DEST' },
    ];

    waypoints.forEach(wp => {
      const x = cx + wp.lon * 1000;
      const y = cy - wp.lat * 1000;

      this.ctx.fillStyle = '#00ff00';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(wp.name, x + 10, y);
    });
  }

  getMesh(): THREE.Mesh {
    return this.mesh;
  }
}

/**
 * Engine Indicating and Crew Alerting System (EICAS)
 */
export class EICAS {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private material: THREE.MeshBasicMaterial;
  private mesh: THREE.Mesh;

  constructor(width: number = 1024, height: number = 400) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.material = new THREE.MeshBasicMaterial({ map: this.texture });
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width / 100, height / 100),
      this.material
    );
  }

  render(data: FlightData) {
    this.ctx.fillStyle = '#0a0e27';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawEngineGauges(data);
    this.drawAlerts(data);

    this.texture.needsUpdate = true;
  }

  private drawEngineGauges(data: FlightData) {
    const gauges = [
      { label: 'N1', value: data.n1, max: 100, x: 100, y: 100, unit: '%' },
      { label: 'N2', value: data.n2, max: 100, x: 300, y: 100, unit: '%' },
      { label: 'EGT', value: data.egt, max: 900, x: 500, y: 100, unit: '°C' },
      { label: 'FF', value: data.fuelFlow, max: 3000, x: 700, y: 100, unit: 'kg/h' },
    ];

    gauges.forEach(gauge => {
      this.drawGauge(gauge.x, gauge.y, gauge.label, gauge.value, gauge.max, gauge.unit);
    });
  }

  private drawGauge(x: number, y: number, label: string, value: number, max: number, unit: string) {
    const radius = 40;

    // Draw dial
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draw needle
    const angle = (value / max) * Math.PI * 2 - Math.PI / 2;
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + Math.cos(angle) * radius * 0.7, y + Math.sin(angle) * radius * 0.7);
    this.ctx.stroke();

    // Label
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, x, y + radius + 20);
    this.ctx.fillText(`${Math.round(value)}${unit}`, x, y + radius + 35);
  }

  private drawAlerts(data: FlightData) {
    const alerts: { message: string; color: string; priority: number }[] = [];

    if (data.n1 < 20) {
      alerts.push({ message: 'ENGINE N1 LOW', color: '#ffff00', priority: 2 });
    }
    if (data.egt > 820) {
      alerts.push({ message: 'EGT WARNING', color: '#ff0000', priority: 1 });
    }
    if (data.oilPressure < 20) {
      alerts.push({ message: 'OIL PRESSURE LOW', color: '#ff0000', priority: 1 });
    }

    alerts.sort((a, b) => a.priority - b.priority);

    let yOffset = 250;
    alerts.forEach(alert => {
      this.ctx.fillStyle = alert.color;
      this.ctx.font = 'bold 14px Arial';
      this.ctx.fillText(alert.message, 100, yOffset);
      yOffset += 25;
    });
  }

  getMesh(): THREE.Mesh {
    return this.mesh;
  }
}
