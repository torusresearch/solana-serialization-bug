const syntaxHighlight = (json) => {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}


const highlight = (newText, oldText) => { 
  let text = '';
  newText.split('\n').forEach((line, line_no)=>{
    let tempText = '';
    line.split('').forEach((val, i)=>{
        if (val != oldText.split('\n')[line_no].charAt(i))
          tempText += val;  
        else
        {
          text +=`<span class='highlight'>${tempText}</span>`;
          tempText = '';
          text += val;            
        }
    });
    if(tempText)
          text +=`<span class='highlight'>${tempText}</span>`;
    text+='\n';
});
  return text;
}


const generateAndVerifyTxSignature = () => {
    const {Transaction, Message, PublicKey, TransactionInstruction, Keypair} = solanaWeb3;
    const signer = Keypair.generate();
    const acc0Writable = Keypair.generate();
    const acc1Writable = Keypair.generate();
    const acc2Writable = Keypair.generate();
    const t0 = new Transaction({
    recentBlockhash: "HZaTsZuhN1aaz9WuuimCFMyH7wJ5xiyMUHFCnZSMyguH",
    feePayer: signer.publicKey
    });
    t0.add(new TransactionInstruction({
    keys: [{
        pubkey: signer.publicKey,
        isSigner: true,
        isWritable: true,
    }, {
        pubkey: acc0Writable.publicKey,
        isSigner: false,
        isWritable: true,
    }],
    programId: Keypair.generate().publicKey
    }))
    t0.add(new TransactionInstruction({
    keys: [{
        pubkey: acc1Writable.publicKey,
        isSigner: false,
        isWritable: false,
    }],
    programId: Keypair.generate().publicKey
    }))
    t0.add(new TransactionInstruction({
    keys: [{
        pubkey: acc2Writable.publicKey,
        isSigner: false,
        isWritable: true,
    }],
    programId: Keypair.generate().publicKey
    }))
    t0.add(new TransactionInstruction({
    keys: [{
        pubkey: signer.publicKey,
        isSigner: true,
        isWritable: true,
    },{
        pubkey: acc0Writable.publicKey,
        isSigner: false,
        isWritable: false,
    },  {
        pubkey: acc2Writable.publicKey,
        isSigner: false,
        isWritable: false,
    }, {
        pubkey: acc1Writable.publicKey,
        isSigner: false,
        isWritable: true,
    }],
    programId: Keypair.generate().publicKey
    }))
    t0.partialSign(signer);
    const t1 = Transaction.from(t0.serialize({requireAllSignatures: false}));
    console.log(t0,t1);
    window.t0=t0;
    window.t1=t1;
    console.log("Transactions are equal = ",JSON.stringify(t0)==JSON.stringify(t1));
    document.querySelector('#tx0').innerHTML=syntaxHighlight(JSON.stringify(t0, undefined, 4));
    document.querySelector('#tx1').innerHTML=highlight(JSON.stringify(t1, undefined, 4), JSON.stringify(t0, undefined, 4));
    document.querySelector('#txequal').innerHTML=JSON.stringify(t0)==JSON.stringify(t1);
    try{
        t1.serialize();
        document.querySelector('#serialize').innerHTML="Signature Verification Passed";
    }
    catch (err){
        console.error(err);
        document.querySelector('#serialize').innerHTML=err;
    }
}

generateAndVerifyTxSignature();



document.querySelector("input#switchWeb3").addEventListener("change",(e)=>{
    let script=document.querySelector('script#web3js');
    document.head.removeChild(script);
    script=document.createElement('script');
    document.querySelector("button#regen").setAttribute("disabled", true);
    if(e.target.checked)
        script.setAttribute("src","https://cdn.jsdelivr.net/npm/@solana/web3.js@1.36.0/lib/index.iife.js");
    else
        script.setAttribute("src","https://cdn.jsdelivr.net/npm/@solana/web3.js@1.31.0/lib/index.iife.js");
    script.id="web3js";
    document.head.appendChild(script);
    const enableBTN = () => {
        document.querySelector('button#regen').removeAttribute("disabled", false);
        script.removeEventListener('load', enableBTN);
    }
    script.addEventListener('load', enableBTN);
})