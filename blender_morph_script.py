import bpy
from mathutils import Vector

def create_subtle_facial_morphs():
    """
    Finom morph targets létrehozása mosómedve fejhez.
    """
    obj = bpy.context.active_object

    if not obj or obj.type != 'MESH':
        print("❌ Válassz ki egy mesh objektumot!")
        return

    print(f"✅ Finom morph targets létrehozása: {obj.name}")

    # Basis shape key
    if not obj.data.shape_keys:
        obj.shape_key_add(name='Basis', from_mix=False)

    mesh = obj.data
    vertices = mesh.vertices

    # Bounding box számítások
    bbox_min = Vector((min(v.co.x for v in vertices), min(v.co.y for v in vertices), min(v.co.z for v in vertices)))
    bbox_max = Vector((max(v.co.x for v in vertices), max(v.co.y for v in vertices), max(v.co.z for v in vertices)))
    center = (bbox_min + bbox_max) / 2
    size = bbox_max - bbox_min

    # 1. BLINK - Finom pislogás
    print("  → Blink shape key...")
    blink = obj.shape_key_add(name='Blink', from_mix=False)
    for i, vert in enumerate(vertices):
        if vert.co.y > center.y + size.y * 0.2:
            factor = (vert.co.y - center.y) / (size.y / 2)
            blink.data[i].co.y -= factor * 0.05

    # 2. SMILE - Finom mosoly
    print("  → Smile shape key...")
    smile = obj.shape_key_add(name='Smile', from_mix=False)
    for i, vert in enumerate(vertices):
        if center.y - size.y * 0.3 < vert.co.y < center.y:
            factor = abs(vert.co.x - center.x) / (size.x / 2)
            smile.data[i].co.x += (vert.co.x - center.x) * 0.08
            smile.data[i].co.y += 0.02

    # 3. SURPRISED - Száj nyitása
    print("  → Surprised shape key...")
    surprised = obj.shape_key_add(name='Surprised', from_mix=False)
    for i, vert in enumerate(vertices):
        if vert.co.y < center.y - size.y * 0.1:
            surprised.data[i].co.y -= 0.06
        if vert.co.y > center.y + size.y * 0.3:
            surprised.data[i].co.y += 0.04

    # 4. SAD - Szomorú
    print("  → Sad shape key...")
    sad = obj.shape_key_add(name='Sad', from_mix=False)
    for i, vert in enumerate(vertices):
        if center.y - size.y * 0.2 < vert.co.y < center.y + size.y * 0.1:
            factor = 1 - abs(vert.co.x - center.x) / (size.x / 2)
            sad.data[i].co.y -= factor * 0.04

    # 5. CONFUSED - Aszimmetrikus
    print("  → Confused shape key...")
    confused = obj.shape_key_add(name='Confused', from_mix=False)
    for i, vert in enumerate(vertices):
        if vert.co.y > center.y + size.y * 0.25:
            side_factor = (vert.co.x - center.x) / (size.x / 2)
            confused.data[i].co.y += side_factor * 0.03

    print("✅ Morph targets sikeresen létrehozva!")
    print("   - Blink, Smile, Surprised, Sad, Confused")
    print("\n💡 Tipp: Object Data Properties → Shape Keys")

# Futtasd
if __name__ == "__main__":
    print("\n" + "="*50)
    print("🦝 RACCOON HEAD - Morph Target Generator")
    print("="*50 + "\n")
    create_subtle_facial_morphs()
