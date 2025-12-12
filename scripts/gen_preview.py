#!/usr/bin/env python3
"""
Create thumbnail grids from PowerPoint presentation slides.

This module provides functionality to generate thumbnail images from
PowerPoint slides. It creates a grid layout of slide thumbnails.

Note: This implementation uses PowerPoint COM automation on Windows,
or LibreOffice on other platforms for PDF export, then converts to images.

Usage:
    python gen_preview.py input.pptx [output_prefix] [--cols N]

Author: aktsmm
License: CC BY-NC 4.0
"""

import argparse
import os
import platform
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import List, Optional, Tuple

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Error: PIL/Pillow is required. Install with: pip install Pillow")
    sys.exit(1)

# Constants
THUMBNAIL_WIDTH = 300
MAX_COLS = 6
DEFAULT_COLS = 5
GRID_PADDING = 20
BORDER_WIDTH = 2
JPEG_QUALITY = 95


def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments.
    
    Returns:
        Parsed command line arguments.
    """
    parser = argparse.ArgumentParser(
        description="Create thumbnail grids from PowerPoint slides.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python gen_preview.py presentation.pptx
    Creates: thumbnails.jpg (using default prefix)

  python gen_preview.py large-deck.pptx grid --cols 4
    Creates: grid-1.jpg, grid-2.jpg, etc.

Grid limits by column count:
  3 cols: max 12 slides per grid (3x4)
  4 cols: max 20 slides per grid (4x5)
  5 cols: max 30 slides per grid (5x6) [default]
  6 cols: max 42 slides per grid (6x7)
        """,
    )
    parser.add_argument("input", help="Input PowerPoint file (.pptx)")
    parser.add_argument(
        "output_prefix",
        nargs="?",
        default="thumbnails",
        help="Output prefix for image files (default: thumbnails)",
    )
    parser.add_argument(
        "--cols",
        type=int,
        default=DEFAULT_COLS,
        help=f"Number of columns (default: {DEFAULT_COLS}, max: {MAX_COLS})",
    )
    return parser.parse_args()


def get_slide_count(pptx_path: Path) -> int:
    """Get the number of slides in a presentation.
    
    Args:
        pptx_path: Path to the PowerPoint file.
        
    Returns:
        Number of slides.
    """
    from pptx import Presentation
    prs = Presentation(pptx_path)
    return len(prs.slides)


def export_to_pdf_windows(pptx_path: Path, pdf_path: Path) -> bool:
    """Export PowerPoint to PDF using COM automation on Windows.
    
    Args:
        pptx_path: Path to the PowerPoint file.
        pdf_path: Path for the output PDF.
        
    Returns:
        True if successful, False otherwise.
    """
    try:
        import comtypes.client
        
        powerpoint = comtypes.client.CreateObject("PowerPoint.Application")
        powerpoint.Visible = True
        
        presentation = powerpoint.Presentations.Open(str(pptx_path.absolute()))
        presentation.SaveAs(str(pdf_path.absolute()), 32)  # 32 = ppSaveAsPDF
        presentation.Close()
        powerpoint.Quit()
        
        return True
    except Exception as e:
        print(f"Warning: COM automation failed: {e}")
        return False


def export_to_pdf_libreoffice(pptx_path: Path, pdf_path: Path) -> bool:
    """Export PowerPoint to PDF using LibreOffice.
    
    Args:
        pptx_path: Path to the PowerPoint file.
        pdf_path: Path for the output PDF.
        
    Returns:
        True if successful, False otherwise.
    """
    try:
        output_dir = pdf_path.parent
        
        result = subprocess.run([
            "soffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", str(output_dir),
            str(pptx_path)
        ], capture_output=True, timeout=120)
        
        # LibreOffice names output based on input filename
        expected_pdf = output_dir / f"{pptx_path.stem}.pdf"
        if expected_pdf.exists() and expected_pdf != pdf_path:
            expected_pdf.rename(pdf_path)
        
        return pdf_path.exists()
    except FileNotFoundError:
        print("Warning: LibreOffice not found")
        return False
    except Exception as e:
        print(f"Warning: LibreOffice conversion failed: {e}")
        return False


def pdf_to_images(pdf_path: Path, output_dir: Path, dpi: int = 100) -> List[Path]:
    """Convert PDF pages to images.
    
    Args:
        pdf_path: Path to the PDF file.
        output_dir: Directory for output images.
        dpi: Resolution in DPI.
        
    Returns:
        List of paths to generated images.
    """
    images = []
    
    try:
        # Try using pdf2image (requires poppler)
        from pdf2image import convert_from_path
        
        pages = convert_from_path(pdf_path, dpi=dpi)
        
        for i, page in enumerate(pages):
            img_path = output_dir / f"slide_{i:03d}.png"
            page.save(img_path, "PNG")
            images.append(img_path)
            
    except ImportError:
        print("Warning: pdf2image not available, trying alternative method")
        
        try:
            # Try using PyMuPDF (fitz)
            import fitz
            
            doc = fitz.open(pdf_path)
            
            for i, page in enumerate(doc):
                pix = page.get_pixmap(matrix=fitz.Matrix(dpi/72, dpi/72))
                img_path = output_dir / f"slide_{i:03d}.png"
                pix.save(str(img_path))
                images.append(img_path)
                
            doc.close()
            
        except ImportError:
            print("Error: Neither pdf2image nor PyMuPDF is available")
            print("Install with: pip install pdf2image  OR  pip install PyMuPDF")
            
    return images


def create_thumbnail_grid(
    images: List[Path],
    output_path: Path,
    cols: int,
    thumbnail_width: int = THUMBNAIL_WIDTH
) -> None:
    """Create a grid of thumbnails from images.
    
    Args:
        images: List of image file paths.
        output_path: Path for the output grid image.
        cols: Number of columns in the grid.
        thumbnail_width: Width of each thumbnail.
    """
    if not images:
        return
    
    # Calculate thumbnail dimensions
    sample = Image.open(images[0])
    aspect_ratio = sample.height / sample.width
    thumbnail_height = int(thumbnail_width * aspect_ratio)
    sample.close()
    
    # Calculate grid dimensions
    rows = (len(images) + cols - 1) // cols
    
    grid_width = cols * thumbnail_width + (cols + 1) * GRID_PADDING
    grid_height = rows * thumbnail_height + (rows + 1) * GRID_PADDING
    
    # Create grid image
    grid = Image.new("RGB", (grid_width, grid_height), "white")
    draw = ImageDraw.Draw(grid)
    
    # Try to load a font for labels
    try:
        font_size = int(thumbnail_width * 0.08)
        if platform.system() == "Windows":
            font = ImageFont.truetype("arial.ttf", font_size)
        else:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    # Place thumbnails
    for i, img_path in enumerate(images):
        row = i // cols
        col = i % cols
        
        x = GRID_PADDING + col * (thumbnail_width + GRID_PADDING)
        y = GRID_PADDING + row * (thumbnail_height + GRID_PADDING)
        
        # Load and resize image
        img = Image.open(img_path)
        img = img.resize((thumbnail_width, thumbnail_height), Image.Resampling.LANCZOS)
        
        # Add border
        for offset in range(BORDER_WIDTH):
            draw.rectangle([
                x - offset - 1, y - offset - 1,
                x + thumbnail_width + offset, y + thumbnail_height + offset
            ], outline="#CCCCCC")
        
        # Paste thumbnail
        grid.paste(img, (x, y))
        
        # Add slide number label
        label = str(i)
        bbox = draw.textbbox((0, 0), label, font=font)
        label_width = bbox[2] - bbox[0]
        label_height = bbox[3] - bbox[1]
        
        label_x = x + thumbnail_width - label_width - 5
        label_y = y + thumbnail_height - label_height - 5
        
        # Draw label background
        draw.rectangle([
            label_x - 2, label_y - 2,
            label_x + label_width + 2, label_y + label_height + 2
        ], fill="white", outline="#CCCCCC")
        
        draw.text((label_x, label_y), label, fill="black", font=font)
        
        img.close()
    
    # Save grid
    grid.save(output_path, "JPEG", quality=JPEG_QUALITY)
    grid.close()


def main() -> None:
    """Main entry point for command-line usage."""
    args = parse_arguments()
    
    # Validate input
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file not found: {args.input}")
        sys.exit(1)
    
    if not input_path.suffix.lower() == ".pptx":
        print("Error: Input must be a PowerPoint file (.pptx)")
        sys.exit(1)
    
    cols = min(args.cols, MAX_COLS)
    if args.cols > MAX_COLS:
        print(f"Warning: Columns limited to {MAX_COLS}")
    
    try:
        slide_count = get_slide_count(input_path)
        print(f"Processing {slide_count} slides...")
        
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            pdf_path = temp_path / "presentation.pdf"
            
            # Export to PDF
            print("Exporting to PDF...")
            if platform.system() == "Windows":
                success = export_to_pdf_windows(input_path, pdf_path)
                if not success:
                    success = export_to_pdf_libreoffice(input_path, pdf_path)
            else:
                success = export_to_pdf_libreoffice(input_path, pdf_path)
            
            if not success or not pdf_path.exists():
                print("Error: Failed to export presentation to PDF")
                print("Please ensure PowerPoint or LibreOffice is installed")
                sys.exit(1)
            
            # Convert PDF to images
            print("Converting to images...")
            images = pdf_to_images(pdf_path, temp_path)
            
            if not images:
                print("Error: Failed to convert PDF to images")
                sys.exit(1)
            
            # Calculate grid parameters
            max_per_grid = cols * (cols + 1)
            num_grids = (len(images) + max_per_grid - 1) // max_per_grid
            
            # Create grids
            created_files = []
            
            for grid_idx in range(num_grids):
                start = grid_idx * max_per_grid
                end = min(start + max_per_grid, len(images))
                grid_images = images[start:end]
                
                if num_grids == 1:
                    output_path = Path(f"{args.output_prefix}.jpg")
                else:
                    output_path = Path(f"{args.output_prefix}-{grid_idx + 1}.jpg")
                
                print(f"Creating grid: {output_path}")
                create_thumbnail_grid(grid_images, output_path, cols)
                created_files.append(output_path)
            
            print(f"\nCreated {len(created_files)} grid(s):")
            for f in created_files:
                print(f"  - {f}")
                
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
