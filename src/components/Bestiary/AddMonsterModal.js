import React, { useState } from 'react';
import './AddMonsterModal.css';

function AddMonsterModal({ onClose, onAddMonster }) {
  const [name, setName] = useState('');
  const [vd, setVd] = useState('');
  const [type, setType] = useState('');
  const [alignment, setAlignment] = useState('');
  const [origin, setOrigin] = useState('');
  const [size, setSize] = useState('');
  const [px, setPx] = useState('');
  const [armor, setArmor] = useState('');
  const [hp, setHp] = useState('');
  const [speed, setSpeed] = useState('');
  const [str, setStr] = useState('');
  const [dex, setDex] = useState('');
  const [con, setCon] = useState('');
  const [int, setInt] = useState('');
  const [wis, setWis] = useState('');
  const [cha, setCha] = useState('');
  const [savingThrows, setSavingThrows] = useState('');
  const [skills, setSkills] = useState('');
  const [senses, setSenses] = useState('');
  const [languages, setLanguages] = useState('');
  const [damageResistances, setDamageResistances] = useState('');
  const [damageImmunities, setDamageImmunities] = useState('');
  const [conditionImmunities, setConditionImmunities] = useState('');
  const [damageVulnerabilities, setDamageVulnerabilities] = useState('');
  const [traits, setTraits] = useState('');
  const [actions, setActions] = useState('');
  const [legendaryActions, setLegendaryActions] = useState('');
  const [reactions, setReactions] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  // New state for the token
  const [tokenType, setTokenType] = useState('color');
  const [tokenValue, setTokenValue] = useState('#ffcccb'); // Default light red
  const [tokenImageFile, setTokenImageFile] = useState(null);
  const [tokenBase64Image, setTokenBase64Image] = useState('');

  const handleTokenFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTokenImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTokenBase64Image(reader.result);
        setTokenValue(reader.result); // Set tokenValue to the base64 string
      };
      reader.readAsDataURL(file);
    } else {
      setTokenImageFile(null);
      setTokenBase64Image('');
      setTokenValue('#ffcccb'); // Reset to default color if file is removed
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const monsterData = {
      name, vd, type, alignment, origin, size, px, armor, hp, speed, 
      str, dex, con, int, wis, cha, 
      savingThrows, skills, senses, languages, 
      damageResistances, damageImmunities, conditionImmunities, damageVulnerabilities, 
      traits, actions, legendaryActions, reactions, description, image,
      token_type: tokenType,
      token_value: tokenValue
    };
    onAddMonster(monsterData);
    onClose(); // Close modal after adding
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Añadir Nuevo Monstruo</h2>
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="vd">VD:</label>
            <input type="text" id="vd" value={vd} onChange={(e) => setVd(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="type">Tipo:</label>
            <input type="text" id="type" value={type} onChange={(e) => setType(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="alignment">Alineamiento:</label>
            <input type="text" id="alignment" value={alignment} onChange={(e) => setAlignment(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="origin">Origen:</label>
            <input type="text" id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="size">Tamaño:</label>
            <input type="text" id="size" value={size} onChange={(e) => setSize(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="px">PX:</label>
            <input type="text" id="px" value={px} onChange={(e) => setPx(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="armor">Armadura:</label>
            <input type="text" id="armor" value={armor} onChange={(e) => setArmor(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="hp">Puntos de golpe:</label>
            <input type="text" id="hp" value={hp} onChange={(e) => setHp(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="speed">Velocidad:</label>
            <input type="text" id="speed" value={speed} onChange={(e) => setSpeed(e.target.value)} />
          </div>

          {/* Stats */}
          <div className="form-group">
            <label htmlFor="str">FUE:</label>
            <input type="text" id="str" value={str} onChange={(e) => setStr(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="dex">DES:</label>
            <input type="text" id="dex" value={dex} onChange={(e) => setDex(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="con">CONS:</label>
            <input type="text" id="con" value={con} onChange={(e) => setCon(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="int">INT:</label>
            <input type="text" id="int" value={int} onChange={(e) => setInt(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="wis">SAB:</label>
            <input type="text" id="wis" value={wis} onChange={(e) => setWis(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="cha">CAR:</label>
            <input type="text" id="cha" value={cha} onChange={(e) => setCha(e.target.value)} />
          </div>

          {/* Other Details */}
          <div className="form-group">
            <label htmlFor="savingThrows">Tiradas de salvación:</label>
            <input type="text" id="savingThrows" value={savingThrows} onChange={(e) => setSavingThrows(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="skills">Habilidades:</label>
            <input type="text" id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="senses">Sentidos:</label>
            <input type="text" id="senses" value={senses} onChange={(e) => setSenses(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="languages">Idiomas:</label>
            <input type="text" id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="damageResistances">Resistencias al daño:</label>
            <input type="text" id="damageResistances" value={damageResistances} onChange={(e) => setDamageResistances(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="damageImmunities">Inmunidades al daño:</label>
            <input type="text" id="damageImmunities" value={damageImmunities} onChange={(e) => setDamageImmunities(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="conditionImmunities">Inmunidades al estado:</label>
            <input type="text" id="conditionImmunities" value={conditionImmunities} onChange={(e) => setConditionImmunities(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="damageVulnerabilities">Vulnerabilidades al daño:</label>
            <input type="text" id="damageVulnerabilities" value={damageVulnerabilities} onChange={(e) => setDamageVulnerabilities(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="traits">Rasgos:</label>
            <textarea id="traits" value={traits} onChange={(e) => setTraits(e.target.value)}></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="actions">Acciones:</label>
            <textarea id="actions" value={actions} onChange={(e) => setActions(e.target.value)}></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="legendaryActions">Acciones legendarias:</label>
            <textarea id="legendaryActions" value={legendaryActions} onChange={(e) => setLegendaryActions(e.target.value)}></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="reactions">Reacciones:</label>
            <textarea id="reactions" value={reactions} onChange={(e) => setReactions(e.target.value)}></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="description">Descripción:</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="image">URL de la Imagen:</label>
            <input type="text" id="image" value={image} onChange={(e) => setImage(e.target.value)} />
          </div>

          <fieldset>
            <legend>Ficha del Monstruo</legend>
            <div className="form-group">
              <label>Tipo de Ficha:</label>
              <label>
                <input type="radio" value="color" checked={tokenType === 'color'} onChange={() => setTokenType('color')} />
                Color
              </label>
              <label>
                <input type="radio" value="image" checked={tokenType === 'image'} onChange={() => setTokenType('image')} />
                Imagen
              </label>
            </div>
            {tokenType === 'color' ? (
              <div className="form-group">
                <label htmlFor="tokenValue">Color de la Ficha:</label>
                <input type="color" id="tokenValue" value={tokenValue} onChange={(e) => setTokenValue(e.target.value)} />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="tokenImageFile">Archivo de Imagen de la Ficha:</label>
                <input type="file" id="tokenImageFile" onChange={handleTokenFileChange} accept="image/*" />
                {tokenBase64Image && (
                  <div className="current-image-preview">
                    <p>Previsualización de la Ficha:</p>
                    <img src={tokenBase64Image} alt="Token Preview" style={{ maxWidth: '50px', maxHeight: '50px', borderRadius: '50%' }} />
                  </div>
                )}
              </div>
            )}
          </fieldset>

          <div className="modal-actions">
            <button type="submit">Añadir Monstruo</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMonsterModal;
