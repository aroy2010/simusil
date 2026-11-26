(() => {
  const id = Number(new URLSearchParams(location.search).get("m"));
  const names = {9:"Geometría plana",10:"Lectura crítica y evidencia",11:"Geometría espacial",12:"Argumentación",17:"Reto integrador"};
  const numeric = {9:{1:15,2:63,3:75,5:8,6:80,7:100,9:4.5,10:4,11:8,12:255},10:{1:60,2:50,4:36,5:90},11:{1:480,2:126,5:8,6:6,7:108,8:4,9:150,10:8,12:240},12:{},17:{1:34,2:150,3:12,7:80,9:3,10:144,11:90}};
  const endpoint="https://script.google.com/macros/s/AKfycbxxgpPDLh2GscU5I5bqDVFtgyvtoOJdhLNv4f4Nn0ai9L6zl1GL20XHvSjhtEU6SJ5v/exec";
  if (!names[id]) { document.querySelector("#title").textContent="Misión no encontrada"; return; }
  let started=Date.now(), sent=false;
  const el = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  fetch("jueves-borrador.md").then(r=>{if(!r.ok)throw Error();return r.text()}).then(text=>{
    const chunks=text.split(/^## /m).slice(1), section=chunks[id===17?4:id-9];
    const [prompt,solution]=section.split(/^### (?:Claves|Criterios).*$/m);
    const first=prompt.search(/^1\. /m);
    let reading=prompt.slice(prompt.indexOf("\n")+1,first).trim();
    let questions=[...prompt.matchAll(/^(\d+)\. (.+)$/gm)].map(m=>({number:Number(m[1]),text:m[2]}));
    if(id===17){const intro=prompt.match(/Texto: «[^»]+»/);reading="Trabaja cuatro preguntas por tema. "+(intro?intro[0]:"");}
    const keys={}; for(const m of solution.matchAll(/(?:^|\s)(\d+)[.\u2013] ?([\s\S]*?)(?=\s\d+[.\u2013] |$)/g)) keys[Number(m[1])]=m[2].trim();
    el("#title").textContent=(id===17?"Reto integrador":"Misión "+id)+" · "+names[id];
    el("#intro").textContent=id===17?"16 preguntas · Cuatro temas":"12 preguntas · 35 minutos orientativos";
    el("#reading").textContent=reading; el("#heading").textContent="Responde las "+questions.length+" preguntas";
    el("#questions").innerHTML=questions.map(q=>{const auto=Object.hasOwn(numeric[id],q.number);return '<section class="question"><p>'+q.number+'. '+esc(q.text)+'</p><small>'+(auto?'Corrección numérica automática: escribe solo el número.':'Respuesta para revisión: explica o escribe tu resultado.')+'</small>'+(auto?'<input type="text" inputmode="decimal" aria-label="Respuesta '+q.number+'">':'<textarea aria-label="Respuesta '+q.number+'"></textarea>')+'</section>'}).join("");
    el("#finish").addEventListener("click",async()=>{
      if(sent)return;
      const inputs=[...el("#questions").querySelectorAll("input,textarea")], responses=inputs.map(i=>i.value.trim());
      if(responses.some(x=>!x)){el("#status").textContent="Responde todas las preguntas antes de finalizar.";return}
      const invalid=questions.findIndex((q,i)=>Object.hasOwn(numeric[id],q.number)&&!/^[-+]?\d+(?:[.,]\d+)?$/.test(responses[i]));
      if(invalid!==-1){el("#status").textContent="En la pregunta "+questions[invalid].number+" escribe solo un número, sin unidades.";inputs[invalid].focus();return}
      sent=true;el("#finish").disabled=true;
      const correct=questions.reduce((n,q,i)=>n+(Object.hasOwn(numeric[id],q.number)&&Number(responses[i].replace(",","."))===numeric[id][q.number]?1:0),0);
      const total=Object.keys(numeric[id]).length, manual=questions.length-total, durationSeconds=Math.round((Date.now()-started)/1000);
      const detail=JSON.stringify({version:"jueves1",respuestas:questions.map((q,i)=>({numero:q.number,respuesta:responses[i],revision:Object.hasOwn(numeric[id],q.number)?"automatica":"manual"})),automaticasCorrectas:correct,automaticasTotal:total,pendientesRevision:manual});
      const payload={event:"ruta_usil_sesion",student:"Piero",submittedAt:new Date().toISOString(),day:"Jueves",session:(id===17?"Reto integrador":"Misión "+id)+" · "+names[id],area:id===9||id===11?"Matemática":id===17?"Integrado":"Lenguaje",score:correct,total,durationSeconds,answers:responses.map((x,i)=>(i+1)+": "+x+" | "),detail};
      try {await fetch(endpoint,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});el("#status").textContent="Respuestas enviadas. La recepción debe verificarse en la hoja."}catch(e){el("#status").textContent="No se pudo enviar el resultado. Conserva esta página y avisa a tu familia."}
      const key="ruta-usil-piero-v1";try{localStorage.setItem(key,JSON.stringify({...JSON.parse(localStorage.getItem(key)||"{}"),["m"+id]:true}))}catch(e){}
      el("#score").textContent=(total?correct+" de "+total+" respuestas numéricas correctas · ":"")+manual+" respuestas para revisar";
      el("#solutions").innerHTML=questions.map((q,i)=>{const auto=Object.hasOwn(numeric[id],q.number),result=auto?(Number(responses[i].replace(",","."))===numeric[id][q.number]?"Correcta":"Por revisar"):"Revisión manual";return '<li><strong>'+result+' — Tu respuesta: '+esc(responses[i])+'</strong><br>Referencia: '+esc(keys[q.number]||"Consulta los criterios con tu familia.")+'</li>'}).join("");
      el("#feedback").hidden=false;
    });
  }).catch(()=>{el("#status").textContent="No se pudo cargar el material. Vuelve a intentar.";});
})();
